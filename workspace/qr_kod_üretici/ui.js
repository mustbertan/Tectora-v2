<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Kod Oluşturucu</title>
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
        /* ── Spinner Animasyonları ── */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse-success {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        /* ── Spinner ── */
        .spinner-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 40px 20px;
            animation: fadeIn 0.3s ease;
        }

        .spinner {
            width: 56px;
            height: 56px;
            position: relative;
        }

        .spinner-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 3px solid transparent;
            border-top-color: #7c3aed;
            border-right-color: #a78bfa;
            animation: spin 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
        }

        .spinner-inner::before {
            content: '';
            position: absolute;
            top: 6px;
            left: 6px;
            right: 6px;
            bottom: 6px;
            border-radius: 50%;
            border: 2px solid transparent;
            border-bottom-color: #ddd6fe;
            animation: spin 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite reverse;
        }

        .loading-text {
            font-size: 0.95rem;
            color: #6b7280;
            font-weight: 500;
            letter-spacing: 0.3px;
        }

        /* ── QR Result ── */
        .qr-result-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 30px;
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(167, 139, 250, 0.05) 100%);
            border-radius: 12px;
            border: 1px solid rgba(124, 58, 237, 0.2);
            animation: slideUp 0.4s ease;
            opacity: 0;
        }

        .qr-result-wrapper--visible {
            opacity: 1;
        }

        .success-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #d1fae5;
            color: #059669;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            animation: pulse-success 0.6s ease;
        }

        .success-badge svg {
            stroke-width: 3;
        }

        .qr-image-frame {
            position: relative;
            padding: 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(124, 58, 237, 0.15);
            transition: all 0.3s ease;
        }

        .qr-image-frame:hover {
            box-shadow: 0 15px 40px rgba(124, 58, 237, 0.25);
            transform: translateY(-2px);
        }

        .qr-image {
            width: 100%;
            max-width: 300px;
            height: auto;
            display: block;
            opacity: 0.7;
            transition: opacity 0.3s ease;
            image-rendering: crisp-edges;
        }

        .qr-image--loaded {
            opacity: 1;
        }

        .btn-group {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
        }

        .download-btn,
        .copy-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            background: #7c3aed;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
        }

        .download-btn:hover,
        .copy-btn:hover {
            background: #6d28d9;
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(124, 58, 237, 0.3);
        }

        .download-btn:active,
        .copy-btn:active {
            transform: translateY(0);
        }

        .copy-btn--success {
            background: #10b981;
        }

        .copy-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        /* ── Error ── */
        .error-content {
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .error-icon {
            flex-shrink: 0;
            margin-top: 2px;
        }

        .error-text {
            font-weight: 500;
            line-height: 1.5;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
            .qr-result-wrapper {
                padding: 20px;
            }

            .qr-image {
                max-width: 250px;
            }

            .btn-group {
                gap: 10px;
            }

            .download-btn,
            .copy-btn {
                flex: 1;
                justify-content: center;
                font-size: 0.85rem;
                padding: 10px 12px;
            }

            .download-btn span,
            .copy-btn span {
                display: none;
            }
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 shadow-sm">
            <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="text-center">
                    <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">
                        QR Kod Oluşturucu
                    </h1>
                    <p class="mt-2 text-gray-600">Metni hızlıca QR koda dönüştürün</p>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <!-- Input Section -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <label for="qr-input" class="block text-sm font-semibold text-gray-700 mb-3">
                    QR Kod Oluşturacak Metni Girin
                </label>
                <textarea
                    id="qr-input"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
                    rows="4"
                    placeholder="URL, metin, telefon numarası veya başka bir şey yazın..."
                    aria-label="QR kod için metin giri">
                </textarea>

                <div class="mt-4 flex gap-3">
                    <button
                        id="generate-btn"
                        class="flex-1 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold py-3 rounded-lg transition duration-200 transform hover:translate-y-[-2px] active:translate-y-0"
                        aria-label="QR kod oluştur">
                        <span>QR Kod Oluştur</span>
                    </button>
                    <button
                        id="clear-btn"
                        class="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-200"
                        aria-label="Metni temizle">
                        Temizle
                    </button>
                </div>
            </div>

            <!-- Error Message Area -->
            <div id="error-msg" class="hidden"></div>

            <!-- QR Output Container -->
            <div id="qr-container" class="min-h-96 flex items-center justify-center">
                <div class="text-center text-gray-400">
                    <svg class="mx-auto h-16 w-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0v6m0 0v6M3 3h6v6H3V3zm0 12h6v6H3v-6zm12-12h6v6h-6V3zm0 12h6v6h-6v-6z"></path>
                    </svg>
                    <p class="text-sm">QR kod burada görüntülenecek</p>
                </div>
            </div>

            <!-- Info Section -->
            <div class="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 class="text-lg font-semibold text-blue-900 mb-3">Bilgi</h2>
                <ul class="text-sm text-blue-800 space-y-2">
                    <li class="flex items-start gap-2">
                        <span class="text-blue-600 font-bold">•</span>
                        <span>Yukarıdaki alana URL, metin, telefon numarası veya e-posta adresi yazabilirsiniz</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="text-blue-600 font-bold">•</span>
                        <span>Oluşturulan QR kodu indirme veya URL'sini kopyalama seçenekleriniz olacak</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="text-blue-600 font-bold">•</span>
                        <span>QR kodlar herhangi bir cihazla taranabilir</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="text-blue-600 font-bold">•</span>
                        <span>Verileriniz sunucuda saklanmaz, sadece yerel olarak işlenir</span>
                    </li>
                </ul>
            </div>
        </main>

        <!-- Footer -->
        <footer class="mt-16 bg-white border-t border-gray-200 py-8">
            <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
                <p>&copy; 2024 QR Kod Oluşturucu. Tüm hakları saklıdır.</p>
            </div>
        </footer>
    </div>

    <!-- QR Code Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

    <!-- UI Module Script -->
    <script type="module">
        // ── UI Yönetim Modülü ──

        /**
         * Yükleme spinner'ını gösterir
         */
        function showLoading() {
            clearOutput();

            const container = document.getElementById("qr-container");
            if (!container) return;

            const spinnerWrapper = document.createElement("div");
            spinnerWrapper.className = "spinner-wrapper";
            spinnerWrapper.setAttribute("aria-label", "Yükleniyor");
            spinnerWrapper.setAttribute("role", "status");

            const spinner = document.createElement("div");
            spinner.className = "spinner";

            const spinnerInner = document.createElement("div");
            spinnerInner.className = "spinner-inner";

            spinner.appendChild(spinnerInner);

            const loadingText = document.createElement("p");
            loadingText.className = "loading-text";
            loadingText.textContent = "QR Kod oluşturuluyor...";

            spinnerWrapper.appendChild(spinner);
            spinnerWrapper.appendChild(loadingText);
            container.appendChild(spinnerWrapper);
        }

        /**
         * Yükleme spinner'ını gizler
         */
        function hideLoading() {
            const container = document.getElementById("qr-container");
            if (!container) return;

            const spinnerWrapper = container.querySelector(".spinner-wrapper");
            if (spinnerWrapper) {
                spinnerWrapper.remove();
            }
        }

        /**
         * QR kod görselini ve indirme butonunu gösterir
         */
        function showQRCode(imageUrl, altText = "QR Kod") {
            clearOutput();

            const container = document.getElementById("qr-container");
            if (!container) return;

            // Ana wrapper
            const qrWrapper = document.createElement("div");
            qrWrapper.className = "qr-result-wrapper";

            // Görsel çerçevesi
            const imageFrame = document.createElement("div");
            imageFrame.className = "qr-image-frame";

            // QR görsel elementi