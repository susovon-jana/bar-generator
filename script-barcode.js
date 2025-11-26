/* ============================================================
   DOM
============================================================ */
const BD = {
  value: el("barcodeValue"),
  type: el("barcodeType"),
  barColor: el("barColor"),
  bgColor: el("bgColor"),
  includeBg: el("includeBg"),
  width: el("barWidth"),
  height: el("barHeight"),
  showText: el("showText"),
  resolution: el("resolution"),
  format: el("format"),

  preview: el("barcodePreview"),
  download: el("downloadBtn"),
  reset: el("resetBtn"),
  copy: el("copyBtn"),

  error: el("error")
};

function el(id) { return document.getElementById(id); }

/* ============================================================
   LIVE PREVIEW
============================================================ */
function renderBarcode() {
  BD.error.textContent = "";
  const value = BD.value.value.trim();

  if (!value) {
    BD.preview.innerHTML = "";
    BD.download.disabled = true;
    BD.copy.disabled = true;
    return;
  }

  try {
    JsBarcode("#barcodePreview", value, {
      format: BD.type.value,
      lineColor: BD.barColor.value,
      background: BD.includeBg.checked ? BD.bgColor.value : "transparent",
      width: Number(BD.width.value),
      height: Number(BD.height.value),
      displayValue: BD.showText.checked
    });

    BD.download.disabled = false;
    BD.copy.disabled = false;

  } catch (err) {
    BD.error.textContent = "Invalid barcode value for selected type.";
    BD.download.disabled = true;
    BD.copy.disabled = true;
  }
}

/* ============================================================
   COPY BARCODE
============================================================ */
function copyBarcode() {
  const svg = BD.preview.outerHTML;

  const img = new Image();
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width * 2;
    canvas.height = img.height * 2;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (pngBlob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": pngBlob })
        ]);

        BD.copy.textContent = "Copied!";
        setTimeout(() => BD.copy.textContent = "Copy Barcode", 1200);

      } catch {
        BD.error.textContent = "Clipboard permission denied.";
      }
    });

    URL.revokeObjectURL(url);
  };

  img.src = url;
}

/* ============================================================
   DOWNLOAD
============================================================ */
function downloadBarcode() {
  const svg = BD.preview.outerHTML;
  const res = Number(BD.resolution.value);

  if (BD.format.value === "svg") {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "barcode.svg";
    a.click();
    return;
  }

  const img = new Image();
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width * res;
    canvas.height = img.height * res;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((pngBlob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(pngBlob);
      a.download = "barcode.png";
      a.click();
    });

    URL.revokeObjectURL(url);
  };

  img.src = url;
}

/* ============================================================
   RESET
============================================================ */
BD.reset.addEventListener("click", () => {
  document.getElementById("barcode-form").reset();
  BD.preview.innerHTML = "";
  BD.error.textContent = "";
  BD.download.disabled = true;
  BD.copy.disabled = true;
});

/* ============================================================
   EVENT LISTENERS
============================================================ */
[
  BD.value, BD.type, BD.barColor, BD.bgColor,
  BD.includeBg, BD.width, BD.height, BD.showText
].forEach(el => el.addEventListener("input", renderBarcode));

BD.download.addEventListener("click", downloadBarcode);
BD.copy.addEventListener("click", copyBarcode);

/* INITIAL LOAD */
renderBarcode();
