const urlGoogleSheets = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRLWj1lE97_FvrlE2PSkFgqSkxJjHijpKCi4w-FBO-xMjkeXKf9n0--W5oqVu_6FPfNBgbwY0oTdVLC/pub?output=csv';

const inputId = document.getElementById('inputId');
const btnCek = document.getElementById('btnCek');

const loadingArea = document.getElementById('loadingArea');
const hasilArea = document.getElementById('hasilArea');
const errorArea = document.getElementById('errorArea');
const errorText = document.getElementById('errorText');

const namaSiswa = document.getElementById('namaSiswa');
const statusKelulusan = document.getElementById('statusKelulusan');
const pesanSiswa = document.getElementById('pesanSiswa');

function setHidden(el, isHidden) {
    el.classList.toggle('hidden', isHidden);
}

function resetTampilan() {
    setHidden(hasilArea, true);
    setHidden(errorArea, true);
    setHidden(loadingArea, true);
}

function setStatusKelulusan(status) {
    statusKelulusan.classList.remove('status-lulus', 'status-tunda');

    if (String(status).toUpperCase() === 'LULUS') {
        statusKelulusan.classList.add('status-lulus');
    } else {
        statusKelulusan.classList.add('status-tunda');
    }

    statusKelulusan.innerText = status ?? '';
}

// cache agar pencarian saat tombol ditekan cepat
let dataSiswaCache = [];
let isDataLoaded = false;

function loadDataFromGoogleSheets() {
    return new Promise((resolve, reject) => {
        Papa.parse(urlGoogleSheets, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                // results.data = array objek berdasarkan header CSV
                dataSiswaCache = Array.isArray(results.data) ? results.data : [];
                isDataLoaded = true;
                resolve(dataSiswaCache);
            },
            error: function (err) {
                reject(err);
            }
        });
    });
}

async function cekKelulusan() {
    resetTampilan();

    const input = inputId.value.trim();

    if (input === '') {
        errorText.innerText = 'Harap masukkan nomor peserta!';
        setHidden(errorArea, false);
        return;
    }

    // pastikan data sudah terload duluan (real-time melalui Published CSV)
    setHidden(loadingArea, false);

    try {
        if (!isDataLoaded) {
            await loadDataFromGoogleSheets();
        }

        // Jika ingin benar-benar “real-time” setiap klik, paksa reload:
        // await loadDataFromGoogleSheets();

        const siswa = dataSiswaCache.find(item => String(item.id) === input);

        if (!siswa) {
            errorText.innerText = 'Data tidak ditemukan. Pastikan nomor yang dimasukkan benar.';
            setHidden(errorArea, false);
            return;
        }

        namaSiswa.innerText = siswa.nama ?? '';
        pesanSiswa.innerText = siswa.pesan ?? '';
        setStatusKelulusan(siswa.status);
        setHidden(hasilArea, false);
    } catch (err) {
        console.error('Terjadi kesalahan:', err);
        errorText.innerText = 'Gagal memuat data dari Google Sheets. Pastikan link CSV benar dan header kolom sesuai (id, nama, status, pesan).';
        setHidden(errorArea, false);
    } finally {
        setHidden(loadingArea, true);
    }
}

btnCek.addEventListener('click', cekKelulusan);
inputId.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') cekKelulusan();
});

// pastikan tampilan awal konsisten dan mulai load awal
resetTampilan();
loadDataFromGoogleSheets();

