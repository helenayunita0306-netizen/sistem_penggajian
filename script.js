// =====================================================
// BREADPAY
// SISTEM PENGGAJIAN & INSENTIF PABRIK ROTI
// =====================================================


// =====================================================
// 1. KONFIGURASI SUPABASE
// =====================================================

const SUPABASE_URL = "https://bgdgyszgsdrxvbvcejpo.supabase.co";

const SUPABASE_KEY = "sb_publishable_Z3occWig9dENGtyNQPxNJw_MdmTRVHs";


const { createClient } = window.supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================================
// 2. DATA GLOBAL
// =====================================================

let karyawanData = [];
let insentifData = [];
let penggajianData = [];


// =====================================================
// 3. FORMAT RUPIAH
// =====================================================

function formatRupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(value || 0);

}


// =====================================================
// 4. FORMAT TANGGAL
// =====================================================

function formatTanggal(tanggal) {

    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// 5. TANGGAL HEADER
// =====================================================

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );


// =====================================================
// 6. NAVIGASI
// =====================================================

function showPage(pageId, button) {

    document.querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    document.getElementById(pageId)
        .classList.add("active");


    document.querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }


    const titles = {

        dashboard: "Dashboard",

        karyawan: "Data Karyawan",

        insentif: "Data Insentif",

        penggajian: "Data Penggajian"

    };

    document.getElementById("pageTitle")
        .textContent = titles[pageId];


    if (pageId === "karyawan") {
        renderKaryawan();
    }

    if (pageId === "insentif") {
        renderInsentif();
    }

    if (pageId === "penggajian") {
        renderPenggajian();
    }

}


function showPageByName(pageId) {

    const buttons =
        document.querySelectorAll(".nav-item");

    let button = null;

    buttons.forEach(btn => {

        if (
            btn.textContent
                .toLowerCase()
                .includes(pageId)
        ) {
            button = btn;
        }

    });

    showPage(pageId, button);

}


// =====================================================
// 7. LOAD SEMUA DATA
// =====================================================

async function loadData() {

    await loadKaryawan();

    await loadInsentif();

    await loadPenggajian();

    updateDashboard();

}


// =====================================================
// 8. LOAD KARYAWAN
// =====================================================

async function loadKaryawan() {

    const {
        data,
        error
    } = await db
        .from("karyawan")
        .select("*")
        .order("id_karyawan", {
            ascending: false
        });


    if (error) {

        console.error(error);

        alert(
            "Gagal mengambil data karyawan:\n" +
            error.message
        );

        return;
    }


    karyawanData = data || [];

    renderKaryawan();

    updateEmployeeSelects();

}


// =====================================================
// 9. RENDER KARYAWAN
// =====================================================

function renderKaryawan() {

    const table =
        document.getElementById("karyawanTable");

    const search =
        document.getElementById("searchKaryawan")
            ?.value
            .toLowerCase() || "";


    const filtered =
        karyawanData.filter(karyawan =>

            karyawan.nama_karyawan
                .toLowerCase()
                .includes(search)

        );


    if (filtered.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Belum ada data karyawan.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        filtered.map(karyawan => `

            <tr>

                <td>
                    #${karyawan.id_karyawan}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(karyawan.nama_karyawan)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(karyawan.jabatan)}
                </td>

                <td>
                    ${formatRupiah(karyawan.gaji_pokok)}
                </td>

                <td>

                    <button
                        class="btn edit"
                        onclick="editKaryawan(${karyawan.id_karyawan})">

                        Edit

                    </button>

                    <button
                        class="btn delete"
                        onclick="deleteKaryawan(${karyawan.id_karyawan})">

                        Hapus

                    </button>

                </td>

            </tr>

        `).join("");

}


// =====================================================
// 10. MODAL KARYAWAN
// =====================================================

function openKaryawanModal() {

    document.getElementById("karyawanId").value = "";

    document.getElementById("namaKaryawan").value = "";

    document.getElementById("jabatanKaryawan").value = "";

    document.getElementById("gajiPokok").value = "";

    document.getElementById("karyawanModalTitle")
        .textContent = "Tambah Karyawan";


    document.getElementById("karyawanModal")
        .classList.add("show");

}


function closeModal(id) {

    document.getElementById(id)
        .classList.remove("show");

}


// =====================================================
// 11. SIMPAN KARYAWAN
// =====================================================

async function saveKaryawan(event) {

    event.preventDefault();


    const id =
        document.getElementById("karyawanId").value;

    const nama =
        document.getElementById("namaKaryawan").value.trim();

    const jabatan =
        document.getElementById("jabatanKaryawan").value;

    const gaji =
        Number(document.getElementById("gajiPokok").value);


    if (!nama || !jabatan || gaji < 0) {

        alert("Lengkapi data karyawan.");

        return;
    }


    let result;


    if (id) {

        result = await db
            .from("karyawan")
            .update({

                nama_karyawan: nama,

                jabatan: jabatan,

                gaji_pokok: gaji

            })
            .eq(
                "id_karyawan",
                id
            );

    } else {

        result = await db
            .from("karyawan")
            .insert([{

                nama_karyawan: nama,

                jabatan: jabatan,

                gaji_pokok: gaji

            }]);

    }


    if (result.error) {

        console.error(result.error);

        alert(
            "Gagal menyimpan data:\n" +
            result.error.message
        );

        return;
    }


    closeModal("karyawanModal");

    alert(
        id
            ? "Data berhasil diperbarui!"
            : "Karyawan berhasil ditambahkan!"
    );


    await loadKaryawan();

    updateDashboard();

}


// =====================================================
// 12. EDIT KARYAWAN
// =====================================================

function editKaryawan(id) {

    const karyawan =
        karyawanData.find(
            item =>
                item.id_karyawan == id
        );


    if (!karyawan) return;


    document.getElementById("karyawanId").value =
        karyawan.id_karyawan;

    document.getElementById("namaKaryawan").value =
        karyawan.nama_karyawan;

    document.getElementById("jabatanKaryawan").value =
        karyawan.jabatan;

    document.getElementById("gajiPokok").value =
        karyawan.gaji_pokok;


    document.getElementById("karyawanModalTitle")
        .textContent = "Edit Karyawan";


    document.getElementById("karyawanModal")
        .classList.add("show");

}


// =====================================================
// 13. HAPUS KARYAWAN
// =====================================================

async function deleteKaryawan(id) {

    const yakin =
        confirm(
            "Yakin ingin menghapus karyawan ini?\n\n" +
            "Data insentif dan penggajian yang terkait " +
            "juga akan terhapus."
        );


    if (!yakin) return;


    const {
        error
    } = await db
        .from("karyawan")
        .delete()
        .eq(
            "id_karyawan",
            id
        );


    if (error) {

        console.error(error);

        alert(
            "Gagal menghapus data:\n" +
            error.message
        );

        return;
    }


    alert("Data berhasil dihapus!");


    await loadKaryawan();

    await loadInsentif();

    await loadPenggajian();

    updateDashboard();

}


// =====================================================
// 14. DROPDOWN KARYAWAN
// =====================================================

function updateEmployeeSelects() {

    const selects = [

        document.getElementById("insentifKaryawan"),

        document.getElementById("gajiKaryawan")

    ];


    selects.forEach(select => {

        if (!select) return;


        select.innerHTML = `
            <option value="">
                Pilih Karyawan
            </option>
        `;


        karyawanData.forEach(karyawan => {

            select.innerHTML += `

                <option value="${karyawan.id_karyawan}">

                    ${escapeHTML(karyawan.nama_karyawan)}
                    -
                    ${escapeHTML(karyawan.jabatan)}

                </option>

            `;

        });

    });

}


// =====================================================
// 15. LOAD INSENTIF
// =====================================================

async function loadInsentif() {

    const {
        data,
        error
    } = await db
        .from("insentif")
        .select("*")
        .order(
            "id_insentif",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(error);

        return;
    }


    insentifData = data || [];

    renderInsentif();

}


// =====================================================
// 16. RENDER INSENTIF
// =====================================================

function renderInsentif() {

    const table =
        document.getElementById("insentifTable");


    if (insentifData.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Belum ada data insentif.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        insentifData.map(item => {

            const karyawan =
                karyawanData.find(
                    k =>
                        k.id_karyawan ==
                        item.id_karyawan
                );


            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                karyawan?.nama_karyawan
                                || "-"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.jenis_insentif)}
                    </td>

                    <td>
                        ${item.jumlah_produksi} unit
                    </td>

                    <td>
                        ${formatRupiah(item.tarif_insentif)}
                    </td>

                    <td>
                        <strong>
                            ${formatRupiah(item.total_insentif)}
                        </strong>
                    </td>

                    <td>

                        <button
                            class="btn delete"
                            onclick="deleteInsentif(${item.id_insentif})">

                            Hapus

                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


// =====================================================
// 17. MODAL INSENTIF
// =====================================================

function openInsentifModal() {

    if (karyawanData.length === 0) {

        alert(
            "Tambahkan karyawan terlebih dahulu."
        );

        showPageByName("karyawan");

        return;
    }


    document.getElementById("jenisInsentif").value = "";

    document.getElementById("jumlahProduksi").value = "";

    document.getElementById("tarifInsentif").value = "";

    document.getElementById("previewInsentif")
        .textContent = "Rp 0";


    updateEmployeeSelects();


    document.getElementById("insentifModal")
        .classList.add("show");

}


// =====================================================
// 18. HITUNG INSENTIF
// =====================================================

function calculateInsentif() {

    const produksi =
        Number(
            document.getElementById("jumlahProduksi").value
        ) || 0;


    const tarif =
        Number(
            document.getElementById("tarifInsentif").value
        ) || 0;


    const total =
        produksi * tarif;


    document.getElementById("previewInsentif")
        .textContent =
        formatRupiah(total);

}


// =====================================================
// 19. SIMPAN INSENTIF
// =====================================================

async function saveInsentif(event) {

    event.preventDefault();


    const idKaryawan =
        Number(
            document.getElementById("insentifKaryawan").value
        );


    const jenis =
        document.getElementById("jenisInsentif")
            .value.trim();


    const produksi =
        Number(
            document.getElementById("jumlahProduksi").value
        );


    const tarif =
        Number(
            document.getElementById("tarifInsentif").value
        );


    const total =
        produksi * tarif;


    if (
        !idKaryawan ||
        !jenis ||
        produksi < 0 ||
        tarif < 0
    ) {

        alert(
            "Lengkapi data insentif."
        );

        return;
    }


    const {
        error
    } = await db
        .from("insentif")
        .insert([{

            id_karyawan: idKaryawan,

            jenis_insentif: jenis,

            jumlah_produksi: produksi,

            tarif_insentif: tarif,

            total_insentif: total

        }]);


    if (error) {

        console.error(error);

        alert(
            "Gagal menyimpan insentif:\n" +
            error.message
        );

        return;
    }


    closeModal("insentifModal");

    alert(
        "Data insentif berhasil ditambahkan!"
    );


    await loadInsentif();

    updateDashboard();

}


// =====================================================
// 20. HAPUS INSENTIF
// =====================================================

async function deleteInsentif(id) {

    if (
        !confirm(
            "Yakin ingin menghapus insentif ini?"
        )
    ) return;


    const {
        error
    } = await db
        .from("insentif")
        .delete()
        .eq(
            "id_insentif",
            id
        );


    if (error) {

        alert(
            "Gagal menghapus:\n" +
            error.message
        );

        return;
    }


    await loadInsentif();

    updateDashboard();

}


// =====================================================
// 21. LOAD PENGGAJIAN
// =====================================================

async function loadPenggajian() {

    const {
        data,
        error
    } = await db
        .from("penggajian")
        .select("*")
        .order(
            "id_penggajian",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(error);

        return;
    }


    penggajianData =
        data || [];


    renderPenggajian();

}


// =====================================================
// 22. RENDER PENGGAJIAN
// =====================================================

function renderPenggajian() {

    const table =
        document.getElementById("penggajianTable");


    if (penggajianData.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Belum ada data penggajian.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        penggajianData.map(item => {

            const karyawan =
                karyawanData.find(
                    k =>
                        k.id_karyawan ==
                        item.id_karyawan
                );


            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                karyawan?.nama_karyawan
                                || "-"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.periode_gaji)}
                    </td>

                    <td>
                        ${item.total_jam_kerja} jam
                    </td>

                    <td>
                        <strong>
                            ${formatRupiah(item.total_gaji)}
                        </strong>
                    </td>

                    <td>
                        ${formatTanggal(
                            item.tanggal_penggajian
                        )}
                    </td>

                    <td>

                        <button
                            class="btn delete"
                            onclick="deletePenggajian(${item.id_penggajian})">

                            Hapus

                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


// =====================================================
// 23. MODAL PENGGAJIAN
// =====================================================

function openPenggajianModal() {

    if (karyawanData.length === 0) {

        alert(
            "Tambahkan karyawan terlebih dahulu."
        );

        showPageByName("karyawan");

        return;
    }


    document.getElementById("periodeGaji").value = "";

    document.getElementById("jamKerja").value = "";


    updateEmployeeSelects();


    document.getElementById("gajiKaryawan")
        .value = "";


    document.getElementById("previewGajiPokok")
        .textContent = "Rp 0";

    document.getElementById("previewTotalInsentif")
        .textContent = "Rp 0";

    document.getElementById("previewTotalGaji")
        .textContent = "Rp 0";


    document.getElementById("penggajianModal")
        .classList.add("show");

}


// =====================================================
// 24. HITUNG GAJI
// =====================================================

function calculateGaji() {

    const id =
        Number(
            document.getElementById("gajiKaryawan").value
        );


    const karyawan =
        karyawanData.find(
            item =>
                item.id_karyawan == id
        );


    if (!karyawan) {

        document.getElementById("previewGajiPokok")
            .textContent = "Rp 0";

        document.getElementById("previewTotalInsentif")
            .textContent = "Rp 0";

        document.getElementById("previewTotalGaji")
            .textContent = "Rp 0";

        return;
    }


    const totalInsentif =
        insentifData
            .filter(
                item =>
                    item.id_karyawan == id
            )
            .reduce(
                (sum, item) =>
                    sum +
                    Number(item.total_insentif),
                0
            );


    const totalGaji =
        Number(karyawan.gaji_pokok)
        +
        totalInsentif;


    document.getElementById("previewGajiPokok")
        .textContent =
        formatRupiah(karyawan.gaji_pokok);


    document.getElementById("previewTotalInsentif")
        .textContent =
        formatRupiah(totalInsentif);


    document.getElementById("previewTotalGaji")
        .textContent =
        formatRupiah(totalGaji);

}


// =====================================================
// 25. SIMPAN PENGGAJIAN
// =====================================================

async function savePenggajian(event) {

    event.preventDefault();


    const idKaryawan =
        Number(
            document.getElementById("gajiKaryawan").value
        );


    const periode =
        document.getElementById("periodeGaji")
            .value.trim();


    const jamKerja =
        Number(
            document.getElementById("jamKerja").value
        );


    const karyawan =
        karyawanData.find(
            item =>
                item.id_karyawan == idKaryawan
        );


    if (
        !idKaryawan ||
        !karyawan ||
        !periode ||
        jamKerja < 0
    ) {

        alert(
            "Lengkapi data penggajian."
        );

        return;
    }


    const totalInsentif =
        insentifData
            .filter(
                item =>
                    item.id_karyawan ==
                    idKaryawan
            )
            .reduce(
                (sum, item) =>
                    sum +
                    Number(item.total_insentif),
                0
            );


    const totalGaji =
        Number(karyawan.gaji_pokok)
        +
        totalInsentif;


    const {
        error
    } = await db
        .from("penggajian")
        .insert([{

            id_karyawan: idKaryawan,

            periode_gaji: periode,

            total_jam_kerja: jamKerja,

            total_gaji: totalGaji

        }]);


    if (error) {

        console.error(error);

        alert(
            "Gagal menyimpan penggajian:\n" +
            error.message
        );

        return;
    }


    closeModal("penggajianModal");

    alert(
        "Penggajian berhasil diproses!"
    );


    await loadPenggajian();

    updateDashboard();

}


// =====================================================
// 26. HAPUS PENGGAJIAN
// =====================================================

async function deletePenggajian(id) {

    if (
        !confirm(
            "Yakin ingin menghapus data penggajian ini?"
        )
    ) return;


    const {
        error
    } = await db
        .from("penggajian")
        .delete()
        .eq(
            "id_penggajian",
            id
        );


    if (error) {

        alert(
            "Gagal menghapus:\n" +
            error.message
        );

        return;
    }


    await loadPenggajian();

    updateDashboard();

}


// =====================================================
// 27. UPDATE DASHBOARD
// =====================================================

function updateDashboard() {

    document.getElementById("totalKaryawan")
        .textContent =
        karyawanData.length;


    const totalGaji =
        penggajianData.reduce(
            (sum, item) =>
                sum +
                Number(item.total_gaji),
            0
        );


    const totalInsentif =
        insentifData.reduce(
            (sum, item) =>
                sum +
                Number(item.total_insentif),
            0
        );


    document.getElementById("totalPenggajian")
        .textContent =
        formatRupiah(totalGaji);


    document.getElementById("totalInsentif")
        .textContent =
        formatRupiah(totalInsentif);


    renderDashboardTable();

}


// =====================================================
// 28. DASHBOARD TABLE
// =====================================================

function renderDashboardTable() {

    const table =
        document.getElementById("dashboardTable");


    const latest =
        penggajianData.slice(0, 5);


    if (latest.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Belum ada data penggajian.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        latest.map(item => {

            const karyawan =
                karyawanData.find(
                    k =>
                        k.id_karyawan ==
                        item.id_karyawan
                );


            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                karyawan?.nama_karyawan
                                || "-"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.periode_gaji)}
                    </td>

                    <td>
                        ${item.total_jam_kerja} jam
                    </td>

                    <td>
                        <strong>
                            ${formatRupiah(item.total_gaji)}
                        </strong>
                    </td>

                    <td>
                        ${formatTanggal(
                            item.tanggal_penggajian
                        )}
                    </td>

                </tr>

            `;

        }).join("");

}


// =====================================================
// 29. KEAMANAN HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// 30. MULAI APLIKASI
// =====================================================

loadData();