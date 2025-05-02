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


    if category == "food":

        type = request.form['type']
        is_grocery = None

        if type == "groceries":
            is_grocery = 1
        else:
            is_grocery = 0

        query = f"INSERT INTO {category} (amount, date, memo, is_grocery) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (amount, date, memo, is_grocery))  # Execute the query
        conn.commit()  # Commit changes
        cursor.close()  # Close the cursor
        conn.close()  # Close the connection

    elif category == "transportation":
        

        trans_type = request.form['trans_type']
                
        val = None

        if trans_type == "insurance":
            val = "insurance"
        elif trans_type == "gas":
            val = "gas"
        else:
            val = "other"


        query = f"INSERT INTO {category} (amount, date, memo, subcategory) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (amount, date, memo, val))  # Execute the query
        conn.commit()  # Commit changes
        cursor.close()  # Close the cursor
        conn.close()  # Close the connection

    else:
        query = f"INSERT INTO {category} (amount, date, memo) VALUES (%s, %s, %s)"
        cursor.execute(query, (amount, date, memo))  # Execute the query
        conn.commit()  # Commit changes
        cursor.close()  # Close the cursor
        conn.close()  # Close the connection

    return jsonify({'status': 'success'})  # Return success response

@app.route('/get_avg_month', methods=['GET'])
def get_avg_month():

    year = int(request.args.get('year'))

    tables = ["clothing", "drinks", "fitness", "food", "housing", "other", "subscriptions", "transportation"]

    if not year:
        return jsonify({"error": "Year is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    results = {}

    for table in tables:

        if table == "food":
            results[table] = {}
            query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s AND is_grocery = 1"
            cursor.execute(query, (year,))
            amount = cursor.fetchone()
            if amount and amount[0] is not None:
                results[table]["groceries"] = amount[0]
            else:
                results[table]["groceries"] = 0.0

            query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s AND is_grocery = 0"
            cursor.execute(query, (year,))
            amount = cursor.fetchone()
            if amount and amount[0] is not None:
                results[table]["out"] = amount[0]
            else:
                results[table]["out"] = 0.0

            results[table]["total"] = results[table]["out"] + results[table]["groceries"]


        elif table == "transportation":

            results[table] = {}

            insurance_query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s AND subcategory = 'insurance'"
            cursor.execute(insurance_query, (year,))
            amount = cursor.fetchone()

            if amount and amount[0] is not None:
                results[table]["insurance"] = amount[0]
            else:
                results[table]["insurance"] = 0.0

            gas_query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s AND subcategory = 'gas'"
            cursor.execute(gas_query, (year,))
            amount = cursor.fetchone()
            if amount and amount[0] is not None:
                results[table]["gas"] = amount[0]
            else:
                results[table]["gas"] = 0.0


            other_query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s AND subcategory = 'other'"
            cursor.execute(other_query, (year,))
            amount = cursor.fetchone()
            if amount and amount[0] is not None:
                results[table]["other"] = amount[0]
            else:
                results[table]["other"] = 0.0

            results[table]["total"] = results[table]["insurance"] + results[table]["gas"] + results[table]["other"]

        else:

            category_amount = 0.0

            query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s"
            cursor.execute(query, (year,))
            amount = cursor.fetchone()
            if amount and amount[0] is not None:
                    category_amount = amount[0]

            results[table] = category_amount

    query = f"SELECT SUM(amount) FROM income WHERE YEAR(date) = %s"
    cursor.execute(query, (year,))
    amount = cursor.fetchone()

    if amount and amount[0] is not None:
        results['income'] = amount[0]

    cursor.close()
    conn.close()


    return jsonify(results)

@app.route('/get_year_data', methods=['GET'])
def get_year_data():

    year = int(request.args.get('year'))

    tables = ["clothing", "drinks", "fitness", "food", "housing", "other", "subscriptions", "transportation"]

    if not year:
        return jsonify({"error": "Year is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    results = {}

    for table in tables:

        if table == "food":
            results[table] = {}
            query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s AND is_grocery = 1"
            cursor.execute(query, (year,))
            amount = cursor.fetchone()
            if amount and amount[0] is not None:
                results[table]["groceries"] = amount[0]
            else:
                results[table]["groceries"] = 0.0

            query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s AND is_grocery = 0"
            cursor.execute(query, (year,))
            amount = cursor.fetchone()
            if amount and amount[0] is not None:
                results[table]["out"] = amount[0]
            else:
                results[table]["out"] = 0.0

            results[table]["total"] = results[table]["out"] + results[table]["groceries"]


        elif table == "transportation":

            results[table] = {}

            insurance_query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s AND subcategory = 'insurance'"
            cursor.execute(insurance_query, (year,))
            amount = cursor.fetchone()

            if amount and amount[0] is not None:
                results[table]["insurance"] = amount[0]
            else:
                results[table]["insurance"] = 0.0

            gas_query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s AND subcategory = 'gas'"
            cursor.execute(gas_query, (year,))
            amount = cursor.fetchone()
            if amount and amount[0] is not None:
                results[table]["gas"] = amount[0]
            else:
                results[table]["gas"] = 0.0


            other_query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s AND subcategory = 'other'"
            cursor.execute(other_query, (year,))
            amount = cursor.fetchone()
            if amount and amount[0] is not None:
                results[table]["other"] = amount[0]
            else:
                results[table]["other"] = 0.0

            results[table]["total"] = results[table]["insurance"] + results[table]["gas"] + results[table]["other"]

        else:

            category_amount = 0.0

            query = f"SELECT SUM(amount) FROM {table} WHERE YEAR(date) = %s"
            cursor.execute(query, (year,))
            amount = cursor.fetchone()
            if amount and amount[0] is not None:
                    category_amount = amount[0]

            results[table] = category_amount

    query = f"SELECT SUM(amount) FROM income WHERE YEAR(date) = %s"
    cursor.execute(query, (year,))
    amount = cursor.fetchone()

    if amount and amount[0] is not None:
        results['income'] = amount[0]

    cursor.close()
    conn.close()


    return jsonify(results)



@app.route('/get_income_data', methods=['GET'])
def get_income_data():
    year = int(request.args.get('year'))

    if not year:
        return jsonify({"error": "Year is required"}), 400


    conn = get_db_connection()
    cursor = conn.cursor()

    results = {}

    for i in range(1, 13):
        query = "SELECT SUM(amount) FROM income WHERE MONTH(date) = %s AND YEAR(date) = %s"

        cursor.execute(query, (i, year))

        amount = cursor.fetchone()

        results[i] = amount[0] if amount[0] is not None else 0.0


    cursor.close()
    conn.close()


    return jsonify(results)

@app.route('/get_expense_data', methods=['GET'])
def get_expense_data():
    year = int(request.args.get('year'))

    tables = ["clothing", "drinks", "fitness", "food", "housing", "other", "subscriptions", "transportation"]

    if not year:
        return jsonify({"error": "Year is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    results = {}

    # Initialize the results dictionary for each month
    for i in range(1, 13):
        results[i] = 0.0  # Start with 0 for each month

    # Loop through each table and each month
    for i in range(1, 13):
        total_amount = 0.0
        for table in tables:
            query = f"SELECT SUM(amount) FROM {table} WHERE MONTH(date) = %s AND YEAR(date) = %s"
            
            # Execute the query with month and year parameters
            cursor.execute(query, (i, year))
            amount = cursor.fetchone()

            # Add the amount to the total for this month
            if amount and amount[0] is not None:
                total_amount += amount[0]

        # Store the total amount for the current month
        results[i] = total_amount

    cursor.close()
    conn.close()

    return jsonify(results)






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

        results[category] = {}

        if category == "food":
            grocery_query = f"SELECT SUM(amount) FROM {category} WHERE DATE_FORMAT(date, '%Y-%m') = %s AND is_grocery = 1"
            cursor.execute(grocery_query, (month,))
            groceries_total = cursor.fetchone()

            out_query = f"SELECT SUM(amount) FROM {category} WHERE DATE_FORMAT(date, '%Y-%m') = %s AND is_grocery = 0"
            cursor.execute(out_query, (month,))
            out_total = cursor.fetchone()


            grocery_total = float(groceries_total[0]) if groceries_total[0] else 0.0
            out_total = float(out_total[0]) if out_total[0] else 0.0
            
            total = float(grocery_total + out_total)

            # Return both groceries and out totals
            results[category] = {
                "groceries": grocery_total,
                "out": out_total,
                "total": total
            }
        elif category == "transportation":


            insurance_query = f"SELECT SUM(amount) FROM {category} WHERE DATE_FORMAT(date, '%Y-%m') = %s AND subcategory = 'insurance'"
            cursor.execute(insurance_query, (month,))
            insurance_total = cursor.fetchone()

            gas_query = f"SELECT SUM(amount) FROM {category} WHERE DATE_FORMAT(date, '%Y-%m') = %s AND subcategory = 'gas'"
            cursor.execute(gas_query, (month,))
            gas_total = cursor.fetchone()


            other_query = f"SELECT SUM(amount) FROM {category} WHERE DATE_FORMAT(date, '%Y-%m') = %s AND subcategory = 'other'"
            cursor.execute(other_query, (month,))
            other_total = cursor.fetchone()


            insurance_total = float(insurance_total[0]) if insurance_total[0] else 0.0
            gas_total = float(gas_total[0]) if gas_total[0] else 0.0
            other_total = float(other_total[0]) if other_total[0] else 0.0
            
            total = float(insurance_total + gas_total + other_total)

            # Return both groceries and out totals
            results[category] = {
                "insurance": insurance_total,
                "gas": gas_total,
                "other": other_total,
                "total": total
            }


        else:            
            query = f"SELECT SUM(amount) FROM {category} WHERE DATE_FORMAT(date, '%Y-%m') = %s"
            cursor.execute(query, (month,))
            result = cursor.fetchone()
            results[category] = float(result[0]) if result[0] else 0.0


    query = f"SELECT SUM(amount) FROM income WHERE DATE_FORMAT(date, '%Y-%m') = %s"
    cursor.execute(query, (month,))
    result = cursor.fetchone()

    if result[0] is None:
        results['income'] = 0.0
    else:
        results['income'] = float(result[0])

    cursor.close()
    conn.close()

    return jsonify(results)

@app.route('/get_category_data', methods=['GET'])
def get_category_data():
    category = request.args.get('category')
    month = request.args.get('month')  # Expected format: YYYY-MM

    valid_categories = ["clothing", "drinks", "fitness", "food", "housing", "other", "subscriptions", "transportation"]
    if not category or category not in valid_categories or not month:
        return jsonify({"error": "Invalid category or month"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if category == "food":
        query = "SELECT amount, date, memo FROM food WHERE DATE_FORMAT(date, '%Y-%m') = %s ORDER BY date DESC"
    elif category == "transportation":
        query = "SELECT amount, date, memo, subcategory FROM transportation WHERE DATE_FORMAT(date, '%Y-%m') = %s ORDER BY date DESC"
    else:
        query = f"SELECT amount, date, memo FROM {category} WHERE DATE_FORMAT(date, '%Y-%m') = %s ORDER BY date DESC"

    cursor.execute(query, (month,))
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)



if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5001)
























