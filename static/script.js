/* ==========================================================
   KRT AI TERMINAL — frontend logic
   Polls /api/dashboard every 5s and renders the UI.
   ========================================================== */
(function () {
  "use strict";

  var REFRESH_MS = 5000;
  var $ = function (id) { return document.getElementById(id); };

  var inr = function (n) {
    return Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  };
  var vol = function (n) {
    n = Number(n) || 0;
    if (n >= 1e7) return (n / 1e7).toFixed(2) + " Cr";
    if (n >= 1e5) return (n / 1e5).toFixed(2) + " L";
    return n.toLocaleString("en-IN");
  };
  var chgSpan = function (c) {
    var cls = c >= 0 ? "up" : "down";
    var sign = c >= 0 ? "+" : "";
    return '<span class="' + cls + ' mono">' + sign + c.toFixed(2) + "%</span>";
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  };

  /* ---------- renderers ---------- */

  function renderConn(mode, updated) {
    var dot = $("connDot"), txt = $("connText");
    dot.className = "dot " + (mode === "live" ? "live" : "demo");
    txt.textContent = mode === "live"
      ? "LIVE \u00B7 ANGEL ONE \u00B7 " + updated
      : "DEMO MODE \u00B7 " + updated;
  }

  function renderTicker(indices) {
    $("tickerStrip").innerHTML = indices.map(function (x) {
      return '<div class="ticker-item">' +
        '<span class="sym">' + esc(x.symbol) + "</span>" +
        '<span class="mono">' + inr(x.ltp) + "</span>" +
        chgSpan(x.chg) + "</div>";
    }).join("");
  }

  function renderIndices(indices) {
    $("indices").innerHTML = indices.map(function (x) {
      var pill = x.chg >= 0
        ? '<span class="pill up">▲ BULLISH</span>'
        : '<span class="pill down">▼ BEARISH</span>';
      return '<div class="card">' +
        '<div class="name">' + esc(x.symbol) + "</div>" +
        '<div class="val mono">' + inr(x.ltp) + "</div>" +
        '<div class="chg-row">' + chgSpan(x.chg) + pill + "</div>" +
        "</div>";
    }).join("");
  }

  function stockRow(x) {
    return '<div class="row">' +
    "<span>" + makeClickable(0, x.symbol) +
      '<div class="sub">H ' + inr(x.high || 0) + " \u00B7 L " + inr(x.low || 0) + "</div></span>" +
      '<span class="right"><span class="mono">' + inr(x.ltp) + "</span><br>" +
      chgSpan(x.chg) + "</span></div>";
  }

  function renderLists(d) {
    $("gainers").innerHTML = d.gainers.map(stockRow).join("");
    $("losers").innerHTML = d.losers.map(stockRow).join("");
    $("volume").innerHTML = d.volume.map(function (x) {
      return '<div class="row"><span class="sym">' + esc(x.symbol) + "</span>" +
        '<span class="mono muted">' + vol(x.volume) + " sh</span></div>";
    }).join("");
  }
function makeClickable(id, symbol) {
  return `<span class="sym" onclick="window.open('https://www.tradingview.com/chart/?symbol=NSE:${symbol}','_blank')">${symbol}</span>`;
}
  function renderAlerts(alerts) {
    $("alertCount").textContent = alerts.length ? alerts.length + " active" : "";
    if (!alerts.length) {
      $("alerts").innerHTML =
        '<div class="row muted">No confluence alerts right now \u2014 ' +
        "conditions \u0BAA\u0BCA\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4\u0BC1\u0BAE\u0BCD\u0BAA\u0BCB\u0BA4\u0BC1 \u0B87\u0B99\u0BCD\u0B95 \u0BB5\u0BB0\u0BC1\u0BAE\u0BCD.</div>";
      return;
    }
    $("alerts").innerHTML = alerts.map(function (a) {
      return '<div class="row">' +
        '<span><span class="badge ' + esc(a.type) + '">' + esc(a.type) + "</span>" +
        ' <span class="sym" style="margin-left:8px">' + esc(a.symbol) + "</span>" +
        '<div class="sub">' + esc(a.reason) + "</div></span>" +
        chgSpan(a.chg) + "</div>";
    }).join("");
  }

  function renderPulse(d) {
    var stocks = d.gainers.concat(d.losers);
    var adv = stocks.filter(function (s) { return s.chg > 0; }).length;
    var dec = stocks.filter(function (s) { return s.chg < 0; }).length;
    var vix = (d.indices.filter(function (i) { return i.symbol === "INDIA VIX"; })[0] || {});
    var breadth = adv >= dec ? "Positive" : "Negative";
    var cells = [
      ["ADVANCES", '<span class="up">' + adv + "</span>"],
      ["DECLINES", '<span class="down">' + dec + "</span>"],
      ["BREADTH", breadth === "Positive"
        ? '<span class="up">' + breadth + "</span>"
        : '<span class="down">' + breadth + "</span>"],
      ["INDIA VIX", '<span class="mono">' + (vix.ltp ? inr(vix.ltp) : "\u2014") + "</span>"],
      ["ACTIVE ALERTS", '<span style="color:var(--gold)">' + d.alerts.length + "</span>"],
      ["FEED", d.mode === "live"
        ? '<span class="up">Angel One</span>'
        : '<span style="color:var(--gold)">Demo</span>']
    ];
    $("pulse").innerHTML = cells.map(function (c) {
      return '<div class="pulse-cell"><div class="k">' + c[0] + '</div><div class="v">' + c[1] + "</div></div>";
    }).join("");
    $("pulseUpdated").textContent = "updated " + d.updated;
  }

  /* ---------- main loop ---------- */

  function load() {
    fetch("/api/dashboard")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.error) throw new Error(d.error);
        renderConn(d.mode, d.updated);
        renderTicker(d.indices);
        renderIndices(d.indices);
        renderLists(d);
        renderAlerts(d.alerts);
        renderPulse(d);
      })
      .catch(function (e) {
        $("connDot").className = "dot err";
        $("connText").textContent = "ERROR";
        $("alerts").innerHTML =
          '<div class="err-box">Server error: ' + esc(e.message) +
          "<br>Render \u2192 Logs tab check \u0BAA\u0BA3\u0BCD\u0BA3\u0BC1\u0B99\u0BCD\u0B95.</div>";
      });
  }

  load();
  setInterval(load, REFRESH_MS);
})();
