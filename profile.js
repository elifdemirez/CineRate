import { firebaseConfig } from './config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// Firebase'in başlatılması ve ilgili servislerin alınması
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);

// Kullanıcı oturum durumunu izleme ve işlevleri çağırma
onAuthStateChanged(auth, user => {
    if (user) {
        console.log("User is logged in: ", user);
        const userId = user.uid;
        fetchUserProfile(userId);
        document.getElementById('profileImageInput').addEventListener('change', uploadProfilePicture);
        
        // Çıkış düğmesi olay dinleyicisi
        document.getElementById('signoutBtn').addEventListener('click', () => {
            signOut(auth).then(() => {
                console.log('User signed out successfully');
                window.location.href = 'background.html';
            }).catch((error) => {
                alert('Error signing out: ', error);
            });
        });
    } else {
        console.log("No user is logged in");
        window.location.href = 'background.html';  // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendirin
    }
});

// Kullanıcı verilerini Firestore'dan getirme ve profil sayfasını güncelleme
async function fetchUserProfile(userId) {
    const userDocRef = doc(db, "users", userId);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("User data fetched: ", userData);
            displayUserProfile(userData);
            fetchUserComments(userId);
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching user data: ", error);
    }
}

// Kullanıcı verilerini profil sayfasında gösterme
function displayUserProfile(userData) {
    document.getElementById('profileName').innerText = userData.name || 'Profile Name';
    document.getElementById('profileUsername').innerText = '@' + (userData.username || 'username');
    document.getElementById('profilePicture').src = userData.profilePicture || 'default-profile.png';
    document.getElementById('ratedMovies').innerText = `${userData.ratedMovies || 2} rated movies`;
    document.getElementById('seenMovies').innerText = `${userData.seenMovies || 2} seen movies`;

    displayFavoriteMovies(userData.favorites || []);
    displaySeenMovies(userData.seenMoviesList || []);
}

// Kullanıcının favori filmlerini Firestore'dan getirme ve gösterme
async function displayFavoriteMovies(favorites) {
    const container = document.getElementById('favoriteMoviesList');
    container.innerHTML = ''; // Mevcut içeriği temizleme

    for (const movieId of favorites) {
        const movieDetails = await fetchMovieDetails(movieId);
        if (movieDetails) {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');
            movieItem.innerHTML = `<img src="https://image.tmdb.org/t/p/w200/${movieDetails.poster_path}" alt="${movieDetails.title}"><p>${movieDetails.title}</p>`;
            container.appendChild(movieItem);
        }
    }
}

// Kullanıcının izlediği filmleri Firestore'dan getirme ve gösterme
async function displaySeenMovies(seenMoviesList) {
    const container = document.getElementById('seenMoviesList');
    container.innerHTML = ''; // Mevcut içeriği temizleme

    for (const movieId of seenMoviesList) {
        const movieDetails = await fetchMovieDetails(movieId);
        if (movieDetails) {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');
            movieItem.innerHTML = `<img src="https://image.tmdb.org/t/p/w200/${movieDetails.poster_path}" alt="${movieDetails.title}"><p>${movieDetails.title}</p>`;
            container.appendChild(movieItem);
        }
    }
}

// Film detaylarını getiren fonksiyon
async function fetchMovieDetails(movieId) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=e3255be99057ffca5f47d3e384a3c4b2`);
    if (response.ok) {
        return response.json();
    } else {
        console.error('Error fetching movie details:', response.statusText);
        return null;
    }
}

// Kullanıcının yaptığı yorumları Firestore'dan getirme ve gösterme
async function fetchUserComments(userId) {
    const commentsContainer = document.getElementById('userCommentsList');
    commentsContainer.innerHTML = ''; // Mevcut içeriği temizleme

    const ratingsQuery = query(collection(db, "ratings"), where("userId", "==", userId));
    try {
        const querySnapshot = await getDocs(ratingsQuery);
        querySnapshot.forEach(async (doc) => {
            const ratingData = doc.data();
            const movieDetails = await fetchMovieDetails(ratingData.movieId);
            if (movieDetails) {
                const commentItem = document.createElement('div');
                commentItem.classList.add('comment-item');
                commentItem.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w200/${movieDetails.poster_path}" alt="${movieDetails.title}">
                    <div class="comment-content">
                        <h5>${movieDetails.title}</h5>
                        <p>${ratingData.comment}</p>
                        <p>Rating: ${ratingData.rating}/10</p>
                    </div>
                `;
                commentsContainer.appendChild(commentItem);
            }
        });
    } catch (error) {
        console.error("Error fetching user comments: ", error);
    }
}