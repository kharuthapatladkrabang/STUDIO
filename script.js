document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById("loader");
  const tableContainer = document.getElementById("tableContainer");
  const tableBody = document.querySelector("#studioTable tbody");

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbytGQSSHYngYKhBy5HE6tWW9Y33Qz4SldkVO5Yinoi7-dB0XLKspRGcgWl_T-4gYfPK/exec";  // 👉 เปลี่ยนเป็น URL Deploy ของคุณ

  try {
    const res = await fetch(WEB_APP_URL + "?action=get_studio_status");
    const data = await res.json();

    if (data.success && data.rows) {
      tableBody.innerHTML = "";
      data.rows.forEach(row => {
        const [room, status, year, people, note] = row;
        const tr = document.createElement("tr");
        const statusClass = (status === "ว่าง") ? "status-ว่าง" : "status-ไม่ว่าง";
        tr.innerHTML = `
          <td>${room || "-"}</td>
          <td class="${statusClass}">${status || "-"}</td>
          <td>${year || "-"}</td>
          <td>${people || "-"}</td>
          <td>${note || "-"}</td>
        `;
        tableBody.appendChild(tr);
      });
      loader.style.display = "none";
      tableContainer.style.display = "block";
    } else {
      loader.innerHTML = "<p style='color:#ef4444'>ไม่พบข้อมูลจากชีต</p>";
    }
  } catch (err) {
    loader.innerHTML = "<p style='color:#ef4444'>โหลดข้อมูลไม่สำเร็จ</p>";
    console.error(err);
  }
});
