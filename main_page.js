// Profil fotoğrafını büyültme işlevi
function toggleImageSize() {
    const profileImage = document.getElementById("profileImage");

    // Fotoğrafın mevcut boyutunu kontrol et
    if (profileImage.classList.contains("large")) {
        // Eğer büyük boyutta ise küçült
        profileImage.classList.remove("large");
    } else {
        // Eğer küçük boyutta ise büyüt
        profileImage.classList.add("large");
    }
}

// Kenar çubuğunu açma/kapatma işlevi
function toggleNav() {
    const sidebar = document.getElementById("mySidebar");
    const main = document.getElementById("main");
    const openbtn = document.getElementById("openbtn");

    if (sidebar.style.width === "250px") {
        // Kenar çubuğu zaten açıksa kapat
        sidebar.style.width = "0";
        main.style.marginLeft = "0";
        openbtn.style.marginLeft = "0";
    } else {
        // Kenar çubuğu kapalıysa aç
        sidebar.style.width = "250px";
        main.style.marginLeft = "250px";
        openbtn.style.marginLeft = "250px";
    }
}

// API çağrısı yapma işlevi
async function makeAPICall(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error('Ağ yanıtı düzgün değil');
    }
    const data = await response.json();
    return data;
}

// Poster tıklama olay dinleyicisi ekle
document.querySelectorAll('.poster').forEach(poster => {
    poster.addEventListener('click', function (e) {
        e.preventDefault();
        const movieId = this.getAttribute('data-movie-id');
        fetchMovieDetails(movieId);
    });
});

// Oturum açma sayfasına yönlendirme işlevi
function navigateToLogin() {
    window.location.href = 'background.html';
}
function navigateToProfile() {
    window.location.href = 'profile.html';
}

// Kullanıcı verilerini yükleme
document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        // Kullanıcı verilerini yükle ve profil bilgilerini güncelle
        document.getElementById('profileName').innerText = userData.name || 'Lütfen Giriş Yapınız';
        document.getElementById('profileImage').src = userData.profilePicture || 'profile.png';
    } else {
        console.log("Kullanıcı bilgileri bulunamadı.");
    }
});

// Film detaylarını alma işlevi
async function fetchMovieDetails(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=e3255be99057ffca5f47d3e384a3c4b2&language=en-US`;

    try {
        const data = await makeAPICall(url);
        sessionStorage.setItem('movieDetails', JSON.stringify(data));
        window.location.href = 'film_detail.html';
    } catch (error) {
        console.error('Film detayları alınırken hata oluştu:', error);
    }
}

function openNav() {
    // Kenar çubuğunu aç
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    // Kenar çubuğunu kapat
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

// Kategorilere tıklanınca ilgili bölüme kaydır
document.querySelectorAll('.sidebar a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        // Hedef elementin ID'sini al
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // İlgili bölüme kaydır, yumuşak geçiş yap
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }

        // Kenar çubuğunu kapat
        closeNav();
    });
});
