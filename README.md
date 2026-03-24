# 👕 StyleSense – AI Outfit Recommender

## 🚀 Overview

StyleSense is an AI-powered outfit recommendation system that helps users choose the best clothing combinations from their existing wardrobe. It uses computer vision and deep learning to analyze clothing items and suggest compatible outfits based on real-world conditions.

---

## ✨ Features

* 📸 Upload wardrobe images
* 🤖 AI-based outfit recommendations
* 🎨 Detects color, texture, and patterns
* 🔗 Compatibility scoring using deep learning
* 🌦️ Context-aware suggestions (weather & occasion)
* 👤 Personalized recommendations

---

## 🧠 Technologies Used

* **Frontend:** Flutter
* **Backend:** Flask (Python)
* **Machine Learning:**

  * EfficientNet-B0 (Feature Extraction)
  * Siamese Neural Network (Compatibility Check)
* **Database & Storage:** Firebase
* **Deployment:** Docker + GCP

---

## ⚙️ How It Works

1. User uploads clothing images
2. Images are preprocessed (resize, background removal)
3. EfficientNet-B0 extracts features
4. Siamese Network compares clothing items
5. Context filters applied (weather, occasion, preference)
6. Final outfit recommendations generated

---

## 📂 Project Structure

```
stylesense/
│── frontend/        # Flutter app
│── backend/         # Flask API
│── models/          # ML models (EfficientNet + Siamese)
│── dataset/         # Training datasets
│── utils/           # Helper functions
│── requirements.txt
│── README.md
```

---

## 🧪 Datasets Used

* DeepFashion Dataset
* Polyvore Outfit Dataset
* Custom Wardrobe Dataset (real-world images)

---

## 📊 Results

* Top-5 Accuracy: ~87.6%
* F1 Score: ~0.84
* Improved recommendations with context filtering

---

## ⚠️ Limitations

* Depends on image quality
* Requires internet (cloud processing)
* Limited performance on ethnic/traditional wear

---

## 🔮 Future Improvements

* Federated Learning for privacy
* 3D clothing understanding
* Better personalization
* More diverse dataset

---

## 📌 Conclusion

StyleSense simplifies daily outfit selection by combining AI and real-world context. It helps users save time, reduce confusion, and make better use of their existing wardrobe.

---

## 👨‍💻 Team

* M.Gnanapriya
* B.Ashwin Kumar


---

## 📎 Demo / Links

* 🔗 GitHub Repo: [(Add your link)](https://github.com/gnanapriya)
* 🎥 Demo Video: 
![demo video](https://github.com/user-attachments/assets/3ceea3fe-ab19-4ce8-ac84-96cb72a307bb)

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
