### May/June Pre-Internship Project: Healthcare Data Pipeline and Machine Learning System

---

Build a healthcare analytics system using a dataset from Kaggle. The system should clean and store the data in a PostgreSQL database and retrain a machine learning model every Saturday at 12:00 noon to predict patient test results as **Normal**, **Abnormal**, or **Inconclusive**.

Deploy the model using Flask or FastAPI, push your project to GitHub, host it on a free platform such as Vercel, and share the live API link.

---

You can download the data directly from https://www.kaggle.com/datasets/prasad22/healthcare-dataset/data or use the script below to download it from Kaggle Hub:

```python
import kagglehub

# Download latest version
path = kagglehub.dataset_download("prasad22/healthcare-dataset")

print("Path to dataset files:", path)
```

You can learn how to set up your API keys here: https://www.kaggle.com/docs/api#authentication In case you need help, reach out directly via **internship@luxdevhq.com** or **0798166628**

---

#### **Project Overview**

You are required to build an end-to-end healthcare data system using a synthetic dataset downloaded from Kaggle. The system should clean, store, and process healthcare data, and retrain a machine learning model every Saturday at 12:00 noon to predict patient test results.

**Project Objective:** By completing this project, you should be able to:

- Work with real-world structured datasets
- Clean and transform data using Python
- Store data in a relational database (PostgreSQL)
- Build and retrain machine learning models
- Deploy a prediction system as a live API
- Use GitHub for version control and project sharing

---

#### **Dataset Instructions**

- Download the dataset: `healthcare_dataset.csv`
- Healthcare Dataset (10,000 synthetic records)
- Load the dataset into Python using Pandas
- Understand all columns before proceeding

---

##### **Project Tasks**

**1. Data Ingestion**

- Load the dataset from Kaggle
- Store a raw copy in your database

**2. Data Cleaning & Transformation**

You must:

- Handle missing values
- Remove duplicates
- Convert date columns properly
- Standardize categorical values
- Drop irrelevant columns (e.g., Name, Doctor if necessary)
- Prepare the dataset for machine learning

**3. Database Setup**

Use PostgreSQL.

You must:

- Create appropriate tables
- Load cleaned data into the database
- Avoid duplicate records
- Ensure data integrity

**4. Weekly Machine Learning Training**

🕛 Every Saturday at 12:00 noon

**Tasks:**

- Read latest data from the database
- Preprocess features
- Train a classification model
- Evaluate performance
- Save the trained model

**Model Requirements**

You must train with XGBoost and at least one model from the following:

- Logistic Regression
- Decision Tree
- Random Forest

**Evaluation Metrics**

You must evaluate your model using:

- Accuracy
- Precision
- Recall
- F1-score
- Confusion Matrix

**5. Model Saving**

Save your trained model using:

- joblib or pickle

**6. Build and Deploy a Prediction API**

**Step 1: Build the API**

Use:

- FastAPI (recommended) or Flask

Create an endpoint:

- `POST /predict`

**Example Input:**

```json
{
  "Age": 45,
  "Gender": "Male",
  "Blood Type": "O+",
  "Medical Condition": "Diabetes",
  "Billing Amount": 2000.5,
  "Admission Type": "Emergency",
  "Insurance Provider": "Cigna",
  "Medication": "Aspirin"
}
```

**Example Output:**

```json
{
  "predicted_test_result": "Abnormal"
}
```

**Step 2: Push to GitHub**

You must:

- Create a GitHub repository
- Push your complete project

Include:

- Source code
- `requirements.txt`
- `README.md`

Your README must include:

- Project description
- Setup instructions
- How to run the API
- Example request/response

**Step 3: Deploy Your API (Mandatory)**

You must deploy your API to a free hosting platform such as:

- Vercel
- Render
- Railway
- Fly.io

After deployment:

- Ensure your API is publicly accessible
- Test your `/predict` endpoint online

**Step 4: Submit Live Project Link**

You must submit:

- GitHub: `https://github.com/your-username/healthcare-ml-project`
- API: `https://your-app.vercel.app/predict`

---

Submit your work to: **internship@luxdevhq.com**  || cc: **harun@luxdevhq.com** and **mbaabuharun8@gmail.com** 

---

 >> The deployed app should look like the one below:
<img width="960" height="516" alt="image" src="https://github.com/user-attachments/assets/c2eb6912-d8de-4b78-a67e-d97e57509fe0" /> 

 >> The folder structure should be like this or close to it: 
<img width="1024" height="1536" alt="image" src="https://github.com/user-attachments/assets/a0c65c21-883f-427c-96c2-69c59bc66183" />


