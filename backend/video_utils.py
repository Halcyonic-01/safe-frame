"""
Video Processing Utility
Extracts frames from video, applies selected pipelines frame-by-frame,
and recombines into final output video.
"""

import cv2
import os
import tempfile


def process_video(input_path, output_path, pipeline_funcs):
    """
    Process a video by applying pipeline functions to each frame.

    Args:
        input_path: Path to input video file
        output_path: Path to save processed video
        pipeline_funcs: List of functions, each accepting and returning an OpenCV image array
    """
    cap = cv2.VideoCapture(input_path)

    if not cap.isOpened():
        raise ValueError(f"Could not open video: {input_path}")

    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Use mp4v codec for broad compatibility
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frame_count = 0
    print(f"[VIDEO] Processing {total_frames} frames at {fps} FPS...")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Apply each pipeline sequentially
        processed_frame = frame
        for func in pipeline_funcs:
            processed_frame = func(processed_frame)

        out.write(processed_frame)
        frame_count += 1

        if frame_count % 30 == 0:
            print(f"[VIDEO] Processed {frame_count}/{total_frames} frames")

    cap.release()
    out.release()

    print(f"[VIDEO] Complete. Processed {frame_count} frames → {output_path}")
    return output_path
