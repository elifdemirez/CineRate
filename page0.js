import { firebaseConfig } from './config.js';

// Firebase yapılandırması ile uygulamanın başlatılması
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();

// HTML'deki form ve düğmelerin referanslarının alınması
const signupForm = document.querySelector('.registration-form');
const loginForm = document.querySelector('.login-form');
const forgotForm = document.querySelector('.forgot-form');
const signupBtn = document.querySelector('.signupbtn');
const loginBtn = document.querySelector('.loginbtn');
const forgotBtn = document.querySelector('.forgotbtn');
const anchors = document.querySelectorAll('a');

// Sayfa içi geçişler için animasyonların eklenmesi
anchors.forEach(anchor => {
  anchor.addEventListener('click', () => {
    const id = anchor.id;
    switch(id){
      case 'loginLabel':
        // Giriş formunu gösterme, kayıt formunu gizleme
        loginForm.style.animation = 'fadeIn 0.5s ease forwards';
        signupForm.style.animation = 'fadeOut 0.5s ease forwards';
        break;
      case 'signupLabel':
        // Kayıt formunu gösterme, giriş formunu gizleme
        signupForm.style.animation = 'fadeIn 0.5s ease forwards';
        loginForm.style.animation = 'fadeOut 0.5s ease forwards';
        break;
      case 'forgotLabel':
        // Şifremi unuttum formunu görüntüleme
        forgotForm.style.display = 'block';
        break;
    }
  });
});

// Kayıt işlemi gerçekleştiren fonksiyon
signupBtn.addEventListener('click', () => {
  const name = document.querySelector('#name').value;
  const username = document.querySelector('#username').value;
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const uid = user.uid;
      // Kullanıcıya doğrulama e-postası gönderme
      user.sendEmailVerification()
        .then(() => {
          // Doğrulama e-postası gönderildiğinde bildirim gösterme
          alert('Verification email sent. Please check your inbox and verify your email before signing in.');
          // Kayıt formunu gizleme, giriş formunu gösterme
          signupForm.style.animation = 'fadeOut 0.5s ease forwards';
          setTimeout(() => {
            signupForm.style.display = 'none';
          }, 500);
          loginForm.style.animation = 'fadeIn 0.5s ease forwards';
          setTimeout(() => {
            loginForm.style.display = 'block';
          }, 500);
        })
        .catch((error) => {
          alert('Error sending verification email: ' + error.message);
        });

      // Kullanıcı verilerini Firestore'a kaydetme
      firestore.collection('users').doc(uid).set({
        name: name,
        username: username,
        email: email,
        profilePicture: '', // Varsayılan profil resmi
        ratedMovies: 0,
        seenMovies: 0,
        seenMoviesList: [],
        toWatchMoviesList: []
      }).then(() => {
          console.log('User data saved to Firestore');
          window.location.href = "profile.html";
      }).catch((error) => {
          console.error("Error writing document: ", error);
      });
    })
    .catch((error) => {
      alert('Error signing up: ' + error.message);
    });
});

// Giriş işlemi gerçekleştiren fonksiyon
loginBtn.addEventListener('click', () => {
  const email = document.querySelector('#inUsr').value.trim();
  const password = document.querySelector('#inPass').value;
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user.emailVerified) {
        // Doğrulanmış e-posta ile giriş yaptıysa profil sayfasına yönlendirme
        console.log('User is signed in with a verified email.');
        window.location.href = "profile.html";
      } else {
        alert('Please verify your email before signing in.');
      }
    })
    .catch((error) => {
      alert('Error signing in: ' + error.message);
    });
});

// Şifre sıfırlama e-postası gönderen fonksiyon
forgotBtn.addEventListener('click', () => {
  const emailForReset = document.querySelector('#forgotinp').value.trim();
  if (emailForReset.length > 0) {
    auth.sendPasswordResetEmail(emailForReset)
      .then(() => {
        // Şifre sıfırlama e-postası gönderildiğinde bildirim gösterme
        alert('Password reset email sent. Please check your inbox to reset your password.');
        // Şifre sıfırlama formunu gizleme, giriş formunu gösterme
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        forgotForm.style.display = 'none';
      })
      .catch((error) => {
        alert('Error sending password reset email: ' + error.message);
      });
  } else {
    alert('Please enter your email address.');
  }
});
