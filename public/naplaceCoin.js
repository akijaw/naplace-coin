/*!
 * naplaceCoin.js — NA'PLACE 코인 연동 클라이언트 (몬티홀 도박 사이트용)
 *
 * ⚠️ 보안: apiKey 는 부스 전체 권한을 가진 키입니다. 브라우저에 그대로 노출하지 말고
 *    가급적 서버(또는 신뢰된 키오스크)에서만 사용하세요.
 *
 * 사용법:
 *   const coin = createNaplaceCoin({
 *     baseUrl: "https://<your-app>/api/v1",
 *     apiKey:  "nap_live_...",
 *   });
 *   await coin.getStudent("2601");           // 잔액 확인
 *   await coin.placeBet("2601", 100);        // 베팅(학생→부스)
 *   await coin.payout("2601", 300);          // 당첨 지급(부스→학생)
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.createNaplaceCoin = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function createNaplaceCoin(config) {
    var baseUrl = (config && config.baseUrl || "").replace(/\/$/, "");
    var apiKey = config && config.apiKey;
    if (!baseUrl || !apiKey) throw new Error("createNaplaceCoin: baseUrl 과 apiKey 가 필요합니다.");

    async function call(path, opts) {
      opts = opts || {};
      var res = await fetch(baseUrl + path, {
        method: opts.method || "GET",
        headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        cache: "no-store",
      });
      var data = {};
      try { data = await res.json(); } catch (e) {}
      if (!res.ok) {
        var msg = data.message || "요청 실패 (" + res.status + ")";
        var err = new Error(msg);
        err.status = res.status;
        err.code = res.status === 400 && /잔액/.test(msg) ? "INSUFFICIENT_FUNDS" : "API_ERROR";
        throw err;
      }
      return data;
    }

    return {
      me: function () { return call("/me"); },
      getStudent: function (id) { return call("/students/" + encodeURIComponent(id)); },
      // 베팅: 학생 → 부스
      placeBet: function (studentId, amount, title) {
        return call("/transfer", { method: "POST", body: { student_id: String(studentId), amount: amount, type: "student_to_club", title: title || "몬티홀 베팅" } });
      },
      // 당첨 지급: 부스 → 학생
      payout: function (studentId, amount, title) {
        return call("/transfer", { method: "POST", body: { student_id: String(studentId), amount: amount, type: "club_to_student", title: title || "몬티홀 당첨" } });
      },
      // 자동 결제 (학생 승인 없이 즉시 완료)
      createPaymentRequest: function (studentId, amount, title) {
        return call("/payment-requests", { method: "POST", body: { student_id: String(studentId), amount: amount, title: title || "몬티홀 칩 구매" } });
      },
      getPaymentRequest: function (id) { return call("/payment-requests/" + encodeURIComponent(id)); },
      cancelPaymentRequest: function (id) { return call("/payment-requests/" + encodeURIComponent(id) + "/cancel", { method: "POST" }); },
      // 호환용 상태 확인 (자동 결제 성공 시 즉시 approved)
      pollPaymentRequest: async function (id, timeoutMs, everyMs) {
        timeoutMs = timeoutMs || 125000; everyMs = everyMs || 2000;
        var start = Date.now();
        while (Date.now() - start < timeoutMs) {
          var r = await call("/payment-requests/" + encodeURIComponent(id));
          if (r.status !== "pending") return r.status;
          await new Promise(function (res) { setTimeout(res, everyMs); });
        }
        return "expired";
      },
    };
  }
  return createNaplaceCoin;
});
