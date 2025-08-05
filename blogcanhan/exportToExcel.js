const fs = require("fs");
const ExcelJS = require("exceljs");

// Kiểm tra file JSON có tồn tại không
const jsonFilePath = "report.json";
if (!fs.existsSync(jsonFilePath)) {
  console.error(`❌ Lỗi: Không tìm thấy file ${jsonFilePath}`);
  process.exit(1);
}

// Đọc file JSON từ Newman
let rawData;
try {
  rawData = fs.readFileSync(jsonFilePath, "utf-8");
} catch (err) {
  console.error("❌ Lỗi đọc file JSON:", err.message);
  process.exit(1);
}

let jsonData;
try {
  jsonData = JSON.parse(rawData);
} catch (err) {
  console.error("❌ Lỗi phân tích JSON:", err.message);
  process.exit(1);
}

// Kiểm tra cấu trúc JSON hợp lệ
if (!jsonData.run || !Array.isArray(jsonData.run.executions)) {
  console.error("❌ Lỗi: Dữ liệu JSON không đúng định dạng.");
  process.exit(1);
}

// Tạo workbook mới
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("API Report");

// Tạo tiêu đề
worksheet.addRow([
  "STT",
  "Đối tượng",
  "Phương thức",
  "URL",
  "Mô tả",
  "Thông tin body",
  "Status kết quả đầu ra",
  "Dự kiến kết quả đầu ra",
  "Trạng thái",
]);

// Định dạng tiêu đề
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" }, // Màu vàng
  };
});

// Lặp qua dữ liệu từ JSON để ghi vào file Excel
jsonData.run.executions.forEach((execution, index) => {
  worksheet.addRow([
    index + 1, // STT
    execution.item?.name || "N/A", // Đối tượng
    execution.item?.request?.method || "N/A", // Phương thức
    execution.item?.request?.url?.raw || "N/A", // URL
    "Mô tả API", // Mô tả
    JSON.stringify(execution.item?.request?.body || {}), // Thông tin body
    execution.response?.code || "N/A", // Status kết quả đầu ra
    "Dự kiến kết quả đầu ra", // Dự kiến kết quả
    execution.response?.code === 200 ? "Đã hoàn thành" : "Lỗi", // Trạng thái
  ]);
});

// Xuất file Excel
workbook.xlsx.writeFile("API_Report.xlsx").then(() => {
  console.log("✅ Xuất báo cáo Excel thành công!");
}).catch((err) => {
  console.error("❌ Lỗi ghi file Excel:", err.message);
});
