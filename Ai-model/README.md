# 👕 AI Clothing Classification Model

This directory contains the machine learning core and documentation for the smart clothing classification subsystem integrated into the **Community Volunteer Platform**. 

By leveraging Computer Vision, this module automatically categorizes incoming apparel donations, significantly reducing manual sorting labor for charitable organizations.

## 🌟 Key Features
* **Automated Sorting:** Instantly recognizes clothing types (e.g., T-Shirts, Dresses, Pants, Shoes) from uploaded images.
* **Demographic Targeting:** Simultaneously determines if the item is for **Kids** or **Adults** using a multi-label classification paradigm.
* **Cloud Integration:** Deployed via an interactive API endpoint, making it easily accessible by the platform's backend.

## 🚀 Live Space & API Deployment
The model is hosted and deployed on **Hugging Face Spaces** using a Gradio interface.
* 🌐 **Live Interactive Demo:** [Link to your Hugging Face Space](https://huggingface.co/spaces/Ahmedtem/clothes)

---

## 🧠 Model Technical Details

### 1. Dataset & Preprocessing
* **Source:** Trained on the comprehensive `clothing-dataset-full` from Kaggle.
* **Target Formatting:** The model utilizes **Multi-Label Classification**. The raw tabular labels were preprocessed to clean ambiguous terms (like mapping `Not sure` to `Not_sure`) and combined with demographic boolean flags to map explicit `Kids` and `Adults` classes alongside garment types.
* **Augmentation:** Standardized using FastAI’s `RandomResizedCrop` at `128x128` pixels to ensure spatial invariance.

### 2. Architecture & Training
* **Core Network:** Fine-tuned **ResNet18** initialized with pre-trained ImageNet weights.
* **Training Scheme:** Trained for `8 epochs` using FastAI's `fine_tune` method with a learning rate of `3e-3`.
* **Evaluation Metric:** Measured using multi-label accuracy (`accuracy_multi`) with an optimal sigmoid threshold set via validation metrics.
* **Performance:** Achieved an outstanding **96.64% Validation Accuracy** (`accuracy_multi: 0.9664`) on unseen validation data split dynamically (20%) during the data loading stage.

---

## 🔌 System Integration Flow

The machine learning component is connected seamlessly with the main web application backend:

1. **User Upload:** A donor uploads an image of the clothing item on the frontend platform.
2. **Backend API Request:** The platform's `backend` routes the image data securely to our deployed Hugging Face Space API endpoint.
3. **Model Inference:** The model processes the image and returns a high-confidence JSON payload predicting both the garment type and age group (e.g., `Prediction: Shorts for Adults`).
4. **Smart Automation:** The platform automatically logs the item into the inventory database under the correct category without requiring human intervention.

---

## 📁 Directory Content
* `README.md`: This comprehensive module documentation.
* `clothes_classifier_colab.ipynb`: The primary training pipeline notebook used on Google Colab containing data acquisition, preparation, training logs, and threshold tuning charts.

## 🤝 Acknowledgments
* Built using the [FastAI](https://docs.fast.ai/) framework.
* Dataset provided by Alexey Grigorev on Kaggle.
