from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/savings_investments')
def savings_investments():
    return render_template('savings_investments.html')

@app.route('/budget_calculator')
def budget_calculator():
    return render_template('budget_calculator.html')

@app.route('/property_management')
def property_management():
    return render_template('property_management.html')

@app.route('/tax_calculator')
def tax_calculator():
    return render_template('tax_calculator.html')

@app.route('/interest_calculator')
def interest_calculator():
    return render_template('interest_calculator.html')

@app.route('/about_oat')
def about_oat():
    return render_template('about_oat.html')

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5001)  # Change port here
