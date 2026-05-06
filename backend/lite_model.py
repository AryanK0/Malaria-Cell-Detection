from dataclasses import dataclass

import h5py
import numpy as np
from numpy.lib.stride_tricks import sliding_window_view
from PIL import Image


BN_EPSILON = 0.001


@dataclass
class ConvBlock:
    kernel: np.ndarray
    bias: np.ndarray
    gamma: np.ndarray
    beta: np.ndarray
    moving_mean: np.ndarray
    moving_variance: np.ndarray


def _dataset(handle, path):
    return np.asarray(handle[path], dtype=np.float32)


def _load_conv_block(handle, conv_name, batch_norm_name):
    conv_base = f"model_weights/{conv_name}/sequential/{conv_name}"
    bn_base = f"model_weights/{batch_norm_name}/sequential/{batch_norm_name}"
    return ConvBlock(
        kernel=_dataset(handle, f"{conv_base}/kernel"),
        bias=_dataset(handle, f"{conv_base}/bias"),
        gamma=_dataset(handle, f"{bn_base}/gamma"),
        beta=_dataset(handle, f"{bn_base}/beta"),
        moving_mean=_dataset(handle, f"{bn_base}/moving_mean"),
        moving_variance=_dataset(handle, f"{bn_base}/moving_variance"),
    )


def _conv2d_valid(image, kernel, bias):
    windows = sliding_window_view(image, (3, 3), axis=(0, 1))
    output = np.einsum("ijckl,klcf->ijf", windows, kernel, optimize=True)
    output += bias
    return output.astype(np.float32, copy=False)


def _batch_norm(values, block):
    normalized = (values - block.moving_mean) / np.sqrt(block.moving_variance + BN_EPSILON)
    return normalized * block.gamma + block.beta


def _relu(values):
    return np.maximum(values, 0, out=values)


def _max_pool_2x2(values):
    height = values.shape[0] - (values.shape[0] % 2)
    width = values.shape[1] - (values.shape[1] % 2)
    cropped = values[:height, :width, :]
    return cropped.reshape(height // 2, 2, width // 2, 2, values.shape[-1]).max(axis=(1, 3))


def _sigmoid(value):
    return float(1 / (1 + np.exp(-value)))


def _heat_color_map(heatmap):
    heat = np.clip(heatmap, 0, 1)
    red = np.clip(1.5 * heat, 0, 1)
    green = np.clip(1.5 * (1 - np.abs(heat - 0.55) * 2), 0, 1)
    blue = np.clip(1.4 * (1 - heat), 0, 1)
    return np.stack([red, green, blue], axis=-1)


class LiteMalariaModel:
    def __init__(self, model_path):
        with h5py.File(model_path, "r") as handle:
            self.blocks = [
                _load_conv_block(handle, "conv2d", "batch_normalization"),
                _load_conv_block(handle, "conv2d_1", "batch_normalization_1"),
                _load_conv_block(handle, "conv2d_2", "batch_normalization_2"),
                _load_conv_block(handle, "conv2d_3", "batch_normalization_3"),
            ]
            self.dense_kernel = _dataset(handle, "model_weights/dense/sequential/dense/kernel")
            self.dense_bias = _dataset(handle, "model_weights/dense/sequential/dense/bias")
            self.output_kernel = _dataset(handle, "model_weights/dense_1/sequential/dense_1/kernel")
            self.output_bias = _dataset(handle, "model_weights/dense_1/sequential/dense_1/bias")

    def _forward_features(self, image):
        values = image.astype(np.float32, copy=False)
        for block in self.blocks:
            values = _conv2d_valid(values, block.kernel, block.bias)
            values = _batch_norm(values, block)
            values = _relu(values)
            values = _max_pool_2x2(values)
        return values

    def predict(self, image):
        features = self._forward_features(image)
        flat = features.reshape(-1)
        dense = _relu(flat @ self.dense_kernel + self.dense_bias)
        output = dense @ self.output_kernel + self.output_bias
        probability_uninfected = _sigmoid(output[0])
        return probability_uninfected, features

    def build_overlay(self, original_resized, features):
        heatmap = features.mean(axis=-1)
        heatmap = heatmap - heatmap.min()
        max_value = heatmap.max()
        if max_value > 0:
            heatmap = heatmap / max_value

        heat_image = Image.fromarray(np.uint8(heatmap * 255), mode="L").resize(original_resized.shape[:2][::-1])
        heat = np.asarray(heat_image, dtype=np.float32) / 255.0
        heat_color = np.uint8(_heat_color_map(heat) * 255)
        return np.uint8(original_resized * 0.6 + heat_color * 0.4)
