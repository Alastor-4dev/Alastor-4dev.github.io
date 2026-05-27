from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import urllib.parse
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/api/search')
def search():
    query = request.args.get('query', '')
    if not query:
        return jsonify([])
    
    # We can't perfectly mimic FMP search with yfinance easily, 
    # but we can just return the query as a valid symbol to let the user click it.
    return jsonify([{
        "symbol": query.upper(),
        "name": f"Resultado para {query.upper()}",
        "exchange": "Bolsa"
    }])

@app.route('/api/quote/<symbols>')
def quote(symbols):
    # Split symbols
    symbols_list = symbols.split(',')
    results = []
    
    for sym in symbols_list:
        try:
            ticker = yf.Ticker(sym)
            info = ticker.info
            
            # Extract basic quote data
            results.append({
                "symbol": sym,
                "name": info.get("shortName", sym),
                "price": info.get("currentPrice", info.get("regularMarketPrice", 0)),
                "change": info.get("currentPrice", 0) - info.get("previousClose", 0) if info.get("currentPrice") and info.get("previousClose") else 0,
                "changesPercentage": ((info.get("currentPrice", 0) - info.get("previousClose", 0)) / info.get("previousClose", 1)) * 100 if info.get("currentPrice") and info.get("previousClose") else 0,
                "volume": info.get("volume", 0),
                "marketCap": info.get("marketCap", 0),
                "pe": info.get("trailingPE", None)
            })
        except Exception as e:
            print(f"Error fetching quote for {sym}: {e}")
            pass
            
    return jsonify(results)

@app.route('/api/profile/<symbol>')
def profile(symbol):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return jsonify([{
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
        }])
    except Exception:
        return jsonify([])

@app.route('/api/key-metrics/<symbol>')
def key_metrics(symbol):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return jsonify([{
            "enterpriseValueOverEBITDA": info.get("enterpriseToEbitda", None)
        }])
    except Exception:
        return jsonify([])

@app.route('/api/ratios/<symbol>')
def ratios(symbol):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return jsonify([{
            "priceEarningsRatio": info.get("trailingPE", None),
            "priceToBookRatio": info.get("priceToBook", None),
            "priceToSalesRatio": info.get("priceToSalesTrailing12Months", None),
            "priceEarningsToGrowthRatio": info.get("pegRatio", None),
            "debtEquityRatio": info.get("debtToEquity", 0) / 100 if info.get("debtToEquity") else None,
            "currentRatio": info.get("currentRatio", None),
            "returnOnEquity": info.get("returnOnEquity", None),
            "returnOnAssets": info.get("returnOnAssets", None),
            "netProfitMargin": info.get("profitMargins", None),
            "dividendYield": info.get("dividendYield", None)
        }])
    except Exception:
        return jsonify([])

@app.route('/api/historical-price-full/<symbol>')
def history(symbol):
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="3mo")
        historical = []
        for index, row in hist.iterrows():
            historical.append({
                "date": index.strftime('%Y-%m-%d'),
                "close": row["Close"]
            })
        return jsonify({"historical": historical[::-1]}) # Descending order
    except Exception as e:
        print(f"Error history: {e}")
        return jsonify({"historical": []})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
