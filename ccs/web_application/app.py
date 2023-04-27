from flask import Flask, render_template, request, jsonify
from sklearn.decomposition import PCA
from train_model import train
from datetime import datetime
from flask_mail import Mail
import pickle, os, json
import pandas as pd
import numpy as np
import sys
import sqlite3
from flask_sqlalchemy import SQLAlchemy
from flask_user import login_required, UserManager, UserMixin

app = Flask(__name__, template_folder='./views', static_folder='assets')
app.config.from_pyfile('config.cfg')

db_file = './data/database/db.sqlite'
db = SQLAlchemy(app)
mail = Mail(app)

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False, server_default='')
    active = db.Column(db.Boolean(), nullable=False, server_default='0')
    email = db.Column(db.String(255), nullable=False, unique=True)
    status = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    email_confirmed_at = db.Column('confirmed_at', db.DateTime())
   
db.create_all()

# Setup Flask-User and specify the User data-model
user_manager = UserManager(app, db, User)

def populateData(model = None): 
    if not model: 
        model = pickle.load(open(os.path.join('data', 'model', 'model.pkl'), 'rb'))

    output_file = './data/output/datasets.csv'
    # Read csv file
    dataset = pd.read_csv(output_file)

    # Transform data using PCA
    pca = PCA(n_components = 2, random_state=1)
    X_pca = pca.fit_transform(dataset)
    pca.explained_variance_ratio_.cumsum()[1]

    # Predict yield based from X features

    y = model.predict(X_pca)
    _data = json.loads(os.popen('node ./assets/js/get_data.js').read()) 
    # print('Hello world!', file=sys.stderr)

    data = {
        'clusters': [
             { 'x': X_pca[y == 0, 0].tolist(), 'y': X_pca[y == 0, 1].tolist(), 'data': np.array(_data['data'])[y == 0].tolist() },
             { 'x': X_pca[y == 1, 0].tolist(), 'y': X_pca[y == 1, 1].tolist(), 'data': np.array(_data['data'])[y == 1].tolist() },
             { 'x': X_pca[y == 2, 0].tolist(), 'y': X_pca[y == 2, 1].tolist(), 'data': np.array(_data['data'])[y == 2].tolist() },
             { 'x': X_pca[y == 3, 0].tolist(), 'y': X_pca[y == 3, 1].tolist(), 'data': np.array(_data['data'])[y == 3].tolist() },
        ],
        'centroid': { 'x': model.cluster_centers_[:, 0].tolist(), 'y': model.cluster_centers_[:, 1].tolist() },
    }
    return jsonify(data=data)

def insertGrades(filename, students):
    now = datetime.now()
    con = sqlite3.connect(db_file)
    sql = ''' INSERT INTO grades(id, gender, program_enrolled, year_level, age) VALUES(?, ?, ?, ?, ?); '''
    cur = con.cursor()
    cur.execute('INSERT INTO uploads(filename, uploadedAt) VALUES(?, ?);', (filename, now.strftime("%Y-%m-%d %H:%M:%S")))
    cur.execute('DELETE FROM grades')
    for data in students['data']: 
       cur.execute(sql, data)
    con.commit()
    con.close()

def fetchAllGrades():
    con = sqlite3.connect(db_file)
    cur = con.cursor()
    cur.execute('SELECT * FROM grades')
    keys = list(map(lambda x: x[0], cur.description))
    rows = cur.fetchall()
    con.close() 
    return {'keys': keys, 'rows': rows} 

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

@app.route("/")
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route("/about")
@login_required
def about():
    return render_template('about.html')

@app.route("/personal_factors")
@login_required
def personal_factors():
    return render_template('personal_factors.html')

@app.route("/environmental_factors")
@login_required
def environmental_factors():
    return render_template('environmental_factors.html')

@app.route("/academic_aid")
@login_required
def academic_aid():
    return render_template('academic_aid.html')

@app.route("/clustered_data")
@login_required
def clustered_data():
    return render_template('clustered_data.html')

@app.route("/ex")
@login_required
def ex():
    return render_template('explanation.html')

@app.route("/grade_analysis")
@login_required
def grade_analysis():
    return render_template('grade_analysis.html')

@app.route("/programming_evaluation")
@login_required
def programming_evaluation():
    return render_template('programming_evaluation.html')

@app.route("/programming_evaluation", methods=['POST'])
@login_required
def programming_evaluation_data():
    # Run script to clean data 
    return jsonify(json.loads(os.popen('node ./assets/js/programming_evaluation.js').read()))

@app.route("/personal_factors", methods=['POST'])
@login_required
def personal_factors_data():
    # Run script to clean data 
    return jsonify(json.loads(os.popen('node ./assets/js/personal_factors.js').read()))

@app.route("/environmental_factors", methods=['POST'])
@login_required
def environmental_factors_data():
    # Run script to clean data 
    return jsonify(json.loads(os.popen('node ./assets/js/environmental_factors.js').read()))

@app.route("/academic_aid", methods=['POST'])
@login_required
def academic_aid_data():
    # Run script to clean data 
    return jsonify(json.loads(os.popen('node ./assets/js/academic_aid.js').read()))

@app.route("/gender_analysis", methods=['POST'])
@login_required
def gender_analysis_data():
    students = fetchAllGrades()
    # Run script to clean data 
    data = {'students': students }
    return jsonify(data)

@app.route("/dashboard", methods=['POST'])
@login_required
def dashboard_data():
    # Run script to clean data 
    return jsonify(json.loads(os.popen('node ./assets/js/dashboard.js').read()))

@app.route("/update_grade", methods=['POST'])
@login_required
def update_grade():
    id = request.get_json().get('id')
    subject = request.get_json().get('subject')
    grade = request.get_json().get('grade')

    con = sqlite3.connect(db_file)
    sql = f' UPDATE grades SET {subject} = ? WHERE id = ?;'
    cur = con.cursor()
    cur.execute(sql, ( grade, id))
    con.commit()
    con.close()
    
    return jsonify(data='success')

@app.route("/load", methods=['GET'])
@login_required
def load_cluster_data():
    return populateData()

@app.route("/get_recent_uploaded_data", methods=['GET'])
@login_required
def get_recent_uploaded_data():
    con = sqlite3.connect(db_file)
    cur = con.cursor()
    cur.execute('SELECT filename, uploadedAt FROM uploads ORDER BY uploadedAt DESC LIMIT 1;')
    res = cur.fetchone()
    con.commit()
    con.close()
    return jsonify(res)

@app.route('/predict', methods=['POST'])
@login_required
def predict():
    input_dir = './data/upload'
    output_file = './data/output/datasets.csv'
    file = request.files['filepond']
    filename = file.filename

    # Save file
    file.save(input_dir + '/raw_data.csv')

    # Run script to clean data 
    os.system(f'node ../machine_learning/scripts/clean_data.js {input_dir} {output_file}')

    # Get all student ids from csv  
    students = json.loads(os.popen(f'node ./assets/js/save_to_database.js {input_dir}/raw_data.csv').read()) 

    insertGrades(filename, students)

    model = train()
    return populateData(model)
