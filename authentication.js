// "Sign up" linkine tıklandığında kayıt formunu gösterir
document.getElementById('signupLabel').addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('.login-form').style.transform = 'translateX(-100%)';
    document.querySelector('.login-form').style.opacity = '0';
    document.querySelector('.registration-form').style.transform = 'translateX(0)';
    document.querySelector('.registration-form').style.opacity = '1';
});

// "Login" linkine tıklandığında giriş formunu gösterir
document.getElementById('loginLabel').addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('.login-form').style.transform = 'translateX(0)';
    document.querySelector('.login-form').style.opacity = '1';
    document.querySelector('.registration-form').style.transform = 'translateX(100%)';
    document.querySelector('.registration-form').style.opacity = '0';
});

// Login butonuna tıklandığında login fonksiyonunu çağırır
document.querySelector('.loginbtn').addEventListener('click', login);

// Kullanıcı giriş fonksiyonu
function login() {
    const email = document.getElementById('inUsr').value;
    const password = document.getElementById('inPass').value;

    // Firebase Authentication ile kullanıcı girişi yapar
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'profile.html';  // Girişten sonra profil sayfasına yönlendirir
        })
        .catch(error => {
            console.error("Error logging in: ", error);
        });
}

// Signup butonuna tıklandığında signUp fonksiyonunu çağırır
document.querySelector('.signupbtn').addEventListener('click', signUp);

// Kullanıcı kayıt fonksiyonu
function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;

    // Firebase Authentication ile yeni kullanıcı oluşturur ve Firestore veritabanına kullanıcı bilgilerini kaydeder
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            return db.collection('users').doc(user.uid).set({
                name: name,
                username: username,
                email: email,
                profilePicture: 'default-profile.png',  // Varsayılan profil resmi
                ratedMovies: 0,
                seenMovies: 0,
                seenMoviesList: [],
                toWatchMoviesList: []
            });
        })
        .then(() => {
            window.location.href = 'profile.html';  // Kayıttan sonra profil sayfasına yönlendirir
        })
        .catch(error => {
            console.error("Error signing up: ", error);
        });
}
