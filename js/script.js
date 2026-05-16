const inputId = document.getElementById("inputId");
const btnCek = document.getElementById("btnCek");

const btnCekTextDefault = btnCek.innerText;

const loadingArea = document.getElementById("loadingArea");
const hasilArea = document.getElementById("hasilArea");
const errorArea = document.getElementById("errorArea");
const errorText = document.getElementById("errorText");

const namaSiswa = document.getElementById("namaSiswa");
const statusKelulusan = document.getElementById("statusKelulusan");
const pesanSiswa = document.getElementById("pesanSiswa");

const urlAPI =
  "https://script.google.com/macros/s/AKfycbycZoSRw7d_-OOyH4vuMRm-ezdoqZFJpEfn8TONFprpCtcZjuQGGLNsyAIbwUZlUC9REA/exec";

function setHidden(el, isHidden) {
  if (isHidden) {
    el.classList.add("hidden");
    el.style.display = "none";
  } else {
    el.classList.remove("hidden");
    el.style.display = el === loadingArea ? "flex" : "block";
  }
}

function resetTampilan() {
  setHidden(hasilArea, true);
  setHidden(errorArea, true);
  setHidden(loadingArea, true);
}

function setStatusKelulusan(status) {
  statusKelulusan.classList.remove("status-lulus", "status-tunda");

  if (String(status).toUpperCase() === "LULUS") {
    statusKelulusan.classList.add("status-lulus");
  } else {
    statusKelulusan.classList.add("status-tunda");
  }

  statusKelulusan.innerText = status ?? "";
}

function setButtonLoading(isLoading) {
  if (isLoading) {
    btnCek.disabled = true;
    btnCek.innerText = "Memeriksa…";
  } else {
    btnCek.disabled = false;
    btnCek.innerText = btnCekTextDefault;
  }
}

async function cekKelulusan() {
  resetTampilan();

  const input = inputId.value.trim();

  if (input === "") {
    errorText.innerText = "Harap masukkan NISN atau nomor peserta!";
    setHidden(errorArea, false);
    return;
  }

  if (!/^\d+$/.test(input)) {
    errorText.innerText = "NISN atau nomor peserta hanya boleh angka.";
    setHidden(errorArea, false);
    return;
  }

  setHidden(loadingArea, false);
  setButtonLoading(true);

  try {
    const response = await fetch(urlAPI, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const dataSiswa = await response.json();

    const siswa = Array.isArray(dataSiswa)
      ? dataSiswa.find((item) => String(item.id) === input)
      : null;

    if (!siswa) {
      errorText.innerText =
        "Data tidak ditemukan. Pastikan nomor yang dimasukkan benar.";
      setHidden(errorArea, false);
      return;
    }

    namaSiswa.innerText = siswa.nama ?? "";
    pesanSiswa.innerText = siswa.pesan ?? "";
    setStatusKelulusan(siswa.status);
    setHidden(hasilArea, false);
  } catch (err) {
    console.error("Terjadi kesalahan:", err);
    errorText.innerText =
      "Gagal memuat data dari server. Pastikan Web App Apps Script aktif dan header kolom di Sheets sesuai (id, nama, status, pesan).";
    setHidden(errorArea, false);
  } finally {
    setHidden(loadingArea, true);
    setButtonLoading(false);
  }
}

btnCek.addEventListener("click", cekKelulusan);
inputId.addEventListener("keydown", (e) => {
  if (e.key === "Enter") cekKelulusan();
});

resetTampilan();
