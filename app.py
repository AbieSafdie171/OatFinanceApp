from flask import Flask, render_template, request, jsonify
import mysql.connector
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)

# MySQL configuration
def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='Ysmt101m?sforma!',
        database='budget_app'
    )
    return connection

# CSRF Protection
csrf = CSRFProtect(app)

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/investments_calculator')
def investments_calculator():
    return render_template('investments_calculator.html')

@app.route('/budget_calculator')
def budget_calculator():
    return render_template('budget_calculator.html')

@app.route('/property_calculator')
@csrf.exempt  # CSRF protection is disabled for this route
def property_calculator():
    return render_template('property_calculator.html')

@app.route('/tax_calculator')
def tax_calculator():
    return render_template('tax_calculator.html')

@app.route('/interest_calculator')
def interest_calculator():
    return render_template('interest_calculator.html')

@app.route('/about_oat')
def about_oat():
    return render_template('about_oat.html')

# Route for adding an expense
@app.route('/add_expense', methods=['POST'])
@csrf.exempt  # CSRF protection is disabled for this route
def add_expense():
    category = request.form['category']
    amount = request.form['amount']
    date = request.form['date']
    memo = request.form['memo']

    # Get a database connection
    conn = get_db_connection()
    cursor = conn.cursor()

    query = f"INSERT INTO {category} (amount, date, memo) VALUES (%s, %s, %s)"
    cursor.execute(query, (amount, date, memo))  # Execute the query
    conn.commit()  # Commit changes
    cursor.close()  # Close the cursor
    conn.close()  # Close the connection

    return jsonify({'status': 'success'})  # Return success response



@app.route('/get_budget_data', methods=['GET'])
def get_budget_data():
    categories = ['housing', 'food', 'drinks', 'clothing', 'subscriptions', 'fitness', 'transportation', 'other']
    month = request.args.get('month')

    if not month:
        return jsonify({"error": "Month is required"}), 400

    # print(f"Received month: {month}")  # Log the received month parameter

    conn = get_db_connection()
    cursor = conn.cursor()

    results = {}
    for category in categories:
        query = f"SELECT SUM(amount) FROM {category} WHERE DATE_FORMAT(date, '%Y-%m') = %s"
        cursor.execute(query, (month,))
        result = cursor.fetchone()
        # print(f"Category: {category}, Amount: {result[0]}")  # Log the result for each category
        results[category] = float(result[0]) if result[0] else 0.0

    cursor.close()
    conn.close()

    return jsonify(results)

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5001)
























