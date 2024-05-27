// Firebase bağlantısı ve ilgili servislerin alınması
import { firebaseConfig } from './config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, query, where, getDocs, serverTimestamp, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase'in başlatılması ve ilgili servislerin alınması
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sayfa yüklendiğinde çalışacak olan fonksiyon
document.addEventListener('DOMContentLoaded', async () => {
    const movieDetails = JSON.parse(sessionStorage.getItem('movieDetails'));
    if (movieDetails) {
        // Film detaylarının gösterilmesi
        displayMovieDetails(movieDetails);
        // Oy verme bölümünün gösterilmesi
        await displayRatingSection();
        // Yorum bölümünün gösterilmesi
        await displayCommentsSection();
        // Favori butonunun başlatılması
        initializeFavoriteButton(movieDetails.id);
        // İzle butonunun başlatılması
        initializeSeenButton(movieDetails.id);
    } else {
        // Film detaylarının bulunamadığı durumda hata mesajı gösterilmesi
        document.getElementById('film-details-container').innerHTML = '<p>No movie details found.</p>';
    }
  
    // Geri dön butonunun oluşturulması ve dinleyicisinin eklenmesi
    const goBackIcon = document.createElement('div');
    goBackIcon.classList.add('go-back-icon');
    goBackIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
    `;
    goBackIcon.addEventListener('click', () => {
        window.location.href = 'main_page.html';
    });
    document.getElementById('film-details-container').appendChild(goBackIcon);
});

// Film detaylarının gösterilmesi
function displayMovieDetails(details) {
    const container = document.getElementById('film-details-container');
    container.innerHTML = `
        <div class="card mb-3">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="https://image.tmdb.org/t/p/w500${details.poster_path}" class="img-fluid rounded-start" alt="${details.title}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${details.title}</h5>
                        <p class="card-text">${details.overview}</p>
                        <p class="card-text"><small class="text-muted">Release Date: ${details.release_date}</small></p>
                        <p class="card-text"><small class="text-muted">Rating: ${details.vote_average}</small></p>
                        <button id="favorite-button" class="favorite-icon" data-favorited="false">
                            <i class="far fa-heart"></i>
                        </button>
                        <button id="seen-button" class="seen-icon" data-seen="false">
                            <i class="far fa-check-square"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Favori butonunun başlatılması
function initializeFavoriteButton(movieId) {
    const favoriteButton = document.getElementById('favorite-button');
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userId = user.uid;
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.favorites && userData.favorites.includes(movieId)) {
                    favoriteButton.innerHTML = '<i class="fas fa-heart"></i>';
                    favoriteButton.dataset.favorited = 'true';
                }
            }
            favoriteButton.addEventListener('click', () => {
                toggleFavorite(userId, movieId);
            });
        } else {
            favoriteButton.addEventListener('click', () => {
                alert('You need to sign in to add to favorites.');
            });
        }
    });
}

// Favori butonunun durumunu değiştirme
async function toggleFavorite(userId, movieId) {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const userData = userDoc.data();
        const favorites = userData.favorites || [];
        const favoriteButton = document.getElementById('favorite-button');
        if (favorites.includes(movieId)) {
            await updateDoc(userDocRef, {
                favorites: favorites.filter(id => id !== movieId)
            });
            favoriteButton.innerHTML = '<i class="far fa-heart"></i>';
            favoriteButton.dataset.favorited = 'false';
        } else {
            await updateDoc(userDocRef, {
                favorites: arrayUnion(movieId)
            });
            favoriteButton.innerHTML = '<i class="fas fa-heart"></i>';
            favoriteButton.dataset.favorited = 'true';
        }
    }
}

// İzle butonunun başlatılması
function initializeSeenButton(movieId) {
    const seenButton = document.getElementById('seen-button');
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userId = user.uid;
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.seenMoviesList && userData.seenMoviesList.includes(movieId)) {
                    seenButton.innerHTML = '<i class="fas fa-check"></i>';
                    seenButton.dataset.seen = 'true';
                }
            }
            seenButton.addEventListener('click', () => {
                toggleSeen(userId, movieId);
            });
        } else {
            seenButton.addEventListener('click', () => {
                alert('You need to sign in to mark as seen.');
            });
        }
    });
}
// İzle butonunun durumunu değiştirme
async function toggleSeen(userId, movieId) {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const userData = userDoc.data();
        const seenMoviesList = userData.seenMoviesList || [];
        const seenButton = document.getElementById('seen-button');
        if (seenMoviesList.includes(movieId)) {
            await updateDoc(userDocRef, {
                seenMoviesList: seenMoviesList.filter(id => id !== movieId)
            });
            seenButton.innerHTML = '<i class="far fa-check-square"></i>';
            seenButton.dataset.seen = 'false';
        } else {
            await updateDoc(userDocRef, {
                seenMoviesList: arrayUnion(movieId)
            });
            seenButton.innerHTML = '<i class="fas fa-check"></i>';
            seenButton.dataset.seen = 'true';
        }
    }
}


// Oy verme bölümünün gösterilmesi
async function displayRatingSection() {
    const container = document.getElementById('rating-section');
    container.innerHTML = `
        <h3>Rate this movie</h3>
        <form id="rating-form">
            <div class="mb-3">
                <label for="rating" class="form-label">Rating (1-10)</label>
                <input type="number" class="form-control" id="rating" min="1" max="10" required>
            </div>
            <div class="mb-3">
                <label for="comment" class="form-label">Comment</label>
                <textarea class="form-control" id="comment" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    `;
    document.getElementById('rating-form').addEventListener('submit', submitRating);
}

// Oy verme işleminin gerçekleştirilmesi
async function submitRating(event) {
    event.preventDefault();
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;

    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const movieId = JSON.parse(sessionStorage.getItem('movieDetails')).id;
        try {
            // Kullanıcı verilerinin Firestore'dan alınması
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userName = userData.username || 'Unknown User'; // Kullanıcı adının alınması

                // Yorumun eklenmesi
                await addDoc(collection(db, 'ratings'), {
                    userId: userId,
                    userName: userName, // Yorumla birlikte kullanıcı adının kaydedilmesi
                    movieId: movieId,
                    rating: parseInt(rating),
                    comment: comment,
                    timestamp: serverTimestamp()
                });
                console.log('Rating submitted successfully');
                location.reload();
            } else {
                console.error('User data not found');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    } else {
        alert('You need to sign in to submit a rating.');
    }
}

// Yorum bölümünün gösterilmesi ve yorumlarını getirilmesi
async function displayCommentsSection() {
    const container = document.getElementById('comments-section');
    container.innerHTML = `
        <h3>Comments</h3>
        <ul id="comments-list" class="list-group"></ul>
    `;
    const movieId = JSON.parse(sessionStorage.getItem('movieDetails')).id;
    try {
        const q = query(collection(db, 'ratings'), where('movieId', '==', movieId));
        const querySnapshot = await getDocs(q);
        const commentsList = document.getElementById('comments-list');
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            commentsList.innerHTML += `
                <li class="list-group-item">
                    <p>${data.comment}</p>
                    <small>${data.userName}</small>
                    <p>${data.rating} stars</p>
                </li>
            `;
        });
    } catch (error) {
        console.error('Error getting comments:', error);
    }
}