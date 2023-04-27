from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import pandas as pd
import pickle
import os 

def train(): 
    dataset = pd.read_csv(os.path.join("data/output/datasets.csv"))
    dataset.head()

    X_questions = dataset.iloc[:,5:16]
    question_means = X_questions.mean(axis = 0)
    grand_mean = question_means.mean()
    std_by_questions = question_means.std()

    pca = PCA(n_components = 2, random_state=1)
    X_pca = pca.fit_transform(dataset)
    pca.explained_variance_ratio_.cumsum()[1]

    distortions = []
    K = range(1,10)
    for i in K:
        model = KMeans(
                n_clusters=i,
                random_state=1)
        model.fit(X_pca)
        distortions.append(model.inertia_)

    model = KMeans(n_clusters=4, random_state=1)
    model = model.fit(X_pca)
    y = model.predict(X_pca)

    pickle.dump(model, open('data/model/model.pkl', 'wb'))
    return model