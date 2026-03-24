<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Kod Üretici</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }

        .loader {
            border: 4px solid #f3f4f6;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <div class="container mx-auto px-4 py-12">
        <!-- Header -->
        <div class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                🔲 QR Kod Üretici
            </h1>
            <p class="text-gray-600 text-lg">Metninizi anında QR koduna dönüştürün</p>
        </div>

        <!-- Main Container -->
        <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-2xl shadow-2xl p-8 fade-in">
                <!-- Input Section -->
                <form id="qrForm" class="space-y-6">
                    <!-- Metin Input -->
                    <div>
                        <label for="textInput" class="block text-sm font-semibold text-gray-700 mb-2">
                            QR Koda Dönüştürülecek Metin
                        </label>
                        <textarea
                            id="textInput"
                            placeholder="URL, metin, telefon numarası, vb. giriniz..."
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            rows="4"
                            maxlength="2953"
                        ></textarea>
                        <div class="mt-2 flex justify-between items-center">
                            <p class="text-xs text-gray-500">
                                <span id="charCount">0</span> / 2953 karakter
                            </p>
                            <button
                                type="button"
                                id="clearBtn"
                                class="text-xs text-gray-500 hover:text-red-500 transition-colors"
                            >
                                Temizle
                            </button>
                        </div>
                    </div>

                    <!-- Boyut Input -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="sizeInput" class="block text-sm font-semibold text-gray-700 mb-2">
                                QR Kod Boyutu (piksel)
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    type="range"
                                    id="sizeSlider"
                                    min="50"
                                    max="1000"
                                    value="300"
                                    class="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                >
                                <input
                                    type="number"
                                    id="sizeInput"
                                    min="50"
                                    max="1000"
                                    value="300"
                                    class="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-center"
                                >
                            </div>
                            <p class="text-xs text-gray-500 mt-2">50 - 1000 piksel arasında</p>
                        </div>

                        <!-- Download Format -->
                        <div>
                            <label for="formatSelect" class="block text-sm font-semibold text-gray-700 mb-2">
                                İndirme Formatı
                            </label>
                            <select
                                id="formatSelect"
                                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="png">PNG (Varsayılan)</option>
                                <option value="jpg">JPG</option>
                                <option value="webp">WebP</option>
                            </select>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <button
                            type="submit"
                            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>🔄</span>
                            <span>QR Kod Oluştur</span>
                        </button>
                        <button
                            type="button"
                            id="downloadBtn"
                            disabled
                            class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>⬇️</span>
                            <span>İndir</span>
                        </button>
                    </div>
                </form>

                <!-- Error Message -->
                <div
                    id="errorMessage"
                    class="hidden mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded fade-in"
                >
                    <p id="errorText"></p>
                </div>

                <!-- Loading State -->
                <div
                    id="loadingState"
                    class="hidden mt-6 flex flex-col items-center justify-center gap-3 fade-in"
                >
                    <div class="loader"></div>
                    <p class="text-gray-600 font-semibold">QR Kod oluşturuluyor...</p>
                </div>
            </div>

            <!-- QR Code Display -->
            <div
                id="qrContainer"
                class="hidden mt-8 bg-white rounded-2xl shadow-2xl p-8 text-center fade-in"
            >
                <h2 class="text-xl font-bold text-gray-800 mb-6">QR Kodunuz Hazır</h2>
                <div class="bg-gray-100 rounded-lg p-8 inline-block">
                    <img
                        id="qrImage"
                        src=""
                        alt="QR Kod"
                        class="max-w-full h-auto"
                    >
                </div>
                <p id="qrInfo" class="mt-6 text-sm text-gray-600"></p>
            </div>

            <!-- Info Section -->
            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="text-3xl mb-2">✅</div>
                    <h3 class="font-bold text-gray-800 mb-2">Güvenli</h3>
                    <p class="text-sm text-gray-600">Verileriniz sunucuda saklanmaz</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="text-3xl mb-2">⚡</div>
                    <h3 class="font-bold text-gray-800 mb-2">Hızlı</h3>
                    <p class="text-sm text-gray-600">Anında QR kod üretimi</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="text-3xl mb-2">📱</div>
                    <h3 class="font-bold text-gray-800 mb-2">Uyumlu</h3>
                    <p class="text-sm text-gray-600">Tüm cihazlarla çalışır</p>
                </div>
            </div>
        </div>
    </div>

    <script type="module">
        // API Module
        async function generateQRCode(text, size = 200) {
            // Girdi doğrulama kontrolleri
            if (text === null || text === undefined) {
                throw new Error("Metin parametresi boş olamaz.");
            }

            const trimmedText = String(text).trim();

            if (trimmedText.length === 0) {
                throw new Error("QR kod oluşturmak için en az bir karakter giriniz.");
            }

            if (trimmedText.length > 2953) {
                throw new Error(
                    `Metin çok uzun. Maksimum 2953 karakter girilebilir. (Şu an: ${trimmedText.length} karakter)`
                );
            }

            // Boyut doğrulama
            const parsedSize = parseInt(size, 10);

            if (isNaN(parsedSize) || parsedSize < 50) {
                throw new Error("QR kod boyutu en az 50 piksel olmalıdır.");
            }

            if (parsedSize > 1000) {
                throw new Error("QR kod boyutu en fazla 1000 piksel olabilir.");
            }

            // URL oluşturma - metni encode et
            const encodedText = encodeURIComponent(trimmedText);
            const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedText}&size=${parsedSize}x${parsedSize}&color=ffffff&bgcolor=000000`;

            try {
                // API isteği gönder
                const response = await fetch(apiUrl, {
                    method: "GET",
                    signal: AbortSignal.timeout(10000), // 10 saniye timeout
                });

                // HTTP hata kontrolü
                if (!response.ok) {
                    if (response.status === 400) {
                        throw new Error(
                            "Geçersiz istek: Metin QR koda dönüştürülemiyor. Lütfen farklı bir metin deneyin."
                        );
                    } else if (response.status === 404) {
                        throw new Error(
                            "QR kod servisi bulunamadı. Lütfen daha sonra tekrar deneyin."
                        );
                    } else if (response.status === 429) {
                        throw new Error(
                            "Çok fazla istek gönderildi. Lütfen birkaç saniye bekleyip tekrar deneyin."
                        );
                    } else if (response.status >= 500) {
                        throw new Error(
                            `QR kod servisi şu anda kullanılamıyor (Sunucu Hatası: ${response.status}). Lütfen daha sonra tekrar deneyin.`
                        );
                    } else {
                        throw new Error(
                            `QR kod oluşturulamadı. HTTP Hata Kodu: ${response.status}`
                        );
                    }
                }

                // İçerik türü kontrolü - görsel olmalı
                const contentType = response.headers.get("content-type");
                if (contentType && !contentType.startsWith("image/")) {
                    throw new Error(
                        "Sunucudan beklenmeyen bir yanıt alındı. QR kod görseli oluşturulamadı."
                    );
                }

                // Blob'a dönüştür ve yerel URL oluştur (CORS sorunlarını önlemek için)
                const blob = await response.blob();

                if (blob.size === 0) {
                    throw new Error(
                        "Sunucudan boş yanıt alındı. QR kod oluşturulamadı."
                    );
                }

                const localUrl = URL.createObjectURL(blob);
                return { url: localUrl, blob: blob };

            } catch (error) {
                // fetch'in kendi hataları veya yukarıda fırlatılan hatalar
                if (error.name === "AbortError" || error.name === "TimeoutError") {
                    throw new Error(
                        "İstek zaman aşımına uğradı. İnternet bağlantınızı kontrol edip tekrar deneyin."
                    );
                }

                if (error.name === "TypeError" && error.message.includes("fetch")) {
                    throw new Error(
                        "İnternet bağlantısı kurulamadı. Lütfen bağlantınızı kontrol edin."
                    );
                }

                // Zaten anlamlı mesaj içeren hatalar doğrudan fırlatılır
                throw error;
            }
        }

        // DOM Elements
        const qrForm = document.getElementById("qrForm");
        const textInput = document.getElementById("textInput");
        const sizeInput = document.getElementById("sizeInput");
        const sizeSlider = document.getElementById("sizeSlider");
        const charCount = document.getElementById("charCount");
        const clearBtn = document.getElementById("clearBtn");
        const downloadBtn = document.getElementById("downloadBtn");
        const errorMessage = document.getElementById("errorMessage");
        const errorText = document.getElementById("errorText");
        const loadingState = document.getElementById("loadingState");
        const qrContainer = document.getElementById("qrContainer");
        const qrImage = document.getElementById("qrImage");
        const qrInfo = document.getElementById("qrInfo");
        const formatSelect = document.getElementById("formatSelect");

        let currentQRBlob = null;

        // Character count update
        textInput.addEventListener("input", () => {
            charCount.textContent = textInput.value.length;
        });

        // Clear button
        clearBtn.addEventListener("click", () => {
            textInput.value = "";
            charCount.textContent = "0";
            errorMessage.classList.add("hidden");
            qrContainer.classList.add("hidden");
            downloadBtn.disabled = true;
        });

        // Size slider and input sync
        sizeSlider.