CLAUDE MERKEZLİ OTONOM YAZILIM GELİŞTİRME EKOSİSTEMİ

Merhaba.

Bugün anlatacağım sistem, klasik anlamda bir yapay zekâ yardımcı aracı değildir. Bu sistemin amacı, tek bir sohbet penceresinde yanıt veren bir model üretmek değil; bir proje dokümanını anlayan, onu gerçek görevlerine ayıran, bu görevlere uzman ajanlar atayan, tüm süreci ortak mimari altında yöneten ve sonunda çalışan bir yazılım ürünü teslim edebilen Claude merkezli bir geliştirme ekosistemi kurmaktır.

Bu sistemin kalbinde Claude yapay zekâsı bulunur. Ancak Claude burada yalnızca kod yazan bir model değildir. Claude, bu ekosistemin merkezi zekâsı, planlayıcısı, denetleyicisi ve orkestratörü olarak görev yapar. Proje analizi, görev ayrıştırma, ajan atama, süreç yönetimi, revizyon yönetimi, entegrasyon ihtiyacı tespiti, insan girdisi gereken noktaların belirlenmesi, maliyet planlaması ve kalite kontrolü Claude tarafından yürütülür.

Bu sistemin amacı yalnızca kod üretmek değildir. Amaç, yazılım geliştirme sürecinin tamamını otonom ama kontrollü bir üretim ekosistemine dönüştürmektir.

Problem Tanımı
Bugün güçlü yapay zekâ modelleri tek başlarına oldukça iyi kod yazabiliyor. Ancak büyük ve çok katmanlı yazılım projeleri söz konusu olduğunda problem artık sadece kod üretmek değildir.

Özellikle bir oyun motoru, editör sistemi, asset pipeline, export altyapısı, mobil paketleme sistemi, çok modüllü bir uygulama çatısı ya da üretim seviyesinde bir platform geliştirilecekse, asıl zorluk şunlarda ortaya çıkar:

Projeyi doğru anlamak Projeyi gerçek görevlerine ayırmak Hangi işin hangi sırayla yapılacağını belirlemek Uzmanlık gerektiren işleri doğru aktörlere vermek Üretilen modüllerin birbiriyle uyumunu korumak Gerektiğinde insanı yalnızca zorunlu noktalarda sürece dahil etmek Revizeleri tüm sistemi bozmadan uygulamak Dış araçları ve servisleri gerektiği anda sisteme dahil etmek Maliyeti baştan hesaplamak ve süreç boyunca kontrol altında tutmak Tüm bunları ölçeklenebilir ve sürdürülebilir hale getirmek

Klasik tek-model yaklaşımı burada yetersiz kalır. Çünkü büyük proje üretimi artık bir cevap üretme problemi değil; planlama, orkestrasyon, entegrasyon, doğrulama, bakım, maliyet kontrolü ve sürekli geliştirme problemine dönüşür.

Bizim önerdiğimiz sistem tam olarak bu problemi çözmek için tasarlanmıştır.

Temel Vizyon
Bu sistemin temel vizyonu şudur:

Kullanıcı sisteme bir proje dokümanı ya da görev tanımı verir. Sistem bu girdiyi analiz eder, projeyi gerçek iş adımlarına ayırır, her adım için uygun uzman ajanları görevlendirir, bunları ortak mimari ve entegrasyon kuralları altında çalıştırır, gerekli olduğunda insanı yalnızca zorunlu anlarda sürece dahil eder ve sonunda kullanıcıya dağınık parçalar değil, çalışan ve tamamlanmış bir yazılım ürünü teslim eder.

Yani burada amaç, yapay zekâyı yalnızca bir yardımcı değil, koordine çalışan dijital bir geliştirme organizasyonuna dönüştürmektir.

Örneğin kullanıcı sisteme bir 2D oyun motoru dokümanı verdiğinde, sistem bu dokümanı yalnızca özetlemez. Bunun yerine:

çekirdek bileşenleri çıkarır, render sistemi, sahne sistemi, input yapısı, asset yönetimi, editör katmanı, test süreci, export hattı ve yayınlama gereksinimlerini ayırır, her görev için uygun ajanları seçer, bu görevlerin hangi sırayla ilerleyeceğini belirler, bağımlılıklarını çıkarır, çıktıları birbiriyle uyumlu hale getirir, test eder, entegre eder, revize eder, ve sonunda kullanıcıya çalışan bir ürün üretir. 3. Geliştirme Başlamadan Önce: Anlama, Eksik Tespiti ve Yaratıcı Öneri Katmanı

Bu sistemin çok önemli bir özelliği şudur:

Sistem, kendisine verilen proje dokümanını ya da görev tanımını yalnızca uygulamaya geçmez; önce onu gerçekten anlar, eksikleri tespit eder ve projeye değer katabilecek yaratıcı öneriler geliştirir.

Yani süreç doğrudan “dokümanı aldım, geliştirmeye başlıyorum” şeklinde başlamaz.

Önce sistem şunları yapar:

Projenin kapsamını analiz eder Belirsiz alanları tespit eder Eksik bırakılmış bölümleri çıkarır Teknik riskleri belirler Gözden kaçmış gereksinimleri işaretler Projeye değer katabilecek yaratıcı geliştirme fikirleri önerir Daha iyi mimari, daha iyi UX, daha iyi performans, daha iyi ölçeklenebilirlik ya da daha iyi ürün deneyimi yaratabilecek iyileştirmeleri sunar

Örneğin sistem şunları önerebilir:

“Bu motor dokümanında debug araçları eksik.” “Bu projede sahne profilleme paneli eklenirse bakım kolaylaşır.” “Asset pipeline için otomatik atlas üretimi düşünülmeli.” “Mobil export düşünülmüş ama signing yönetimi belirtilmemiş.” “Editör sistemi için undo/redo altyapısı eklenmeli.” “Bu projeye script hata ayıklama katmanı eklenirse ürün daha güçlü olur.” “Mevcut yapı çalışır, ama daha modüler hale getirmek için ECS benzeri bir katman düşünülebilir.”

Burada sistem yalnızca teknik eksik bulmaz. Gerekirse yaratıcı ürün fikirleri de önerir:

kullanıcı deneyimini artıracak özellikler, pazarlanabilirliği güçlendirecek bileşenler, bakım kolaylaştıran araçlar, performans iyileştirmeleri, geliştirici deneyimini artıran paneller, gelecekte büyümeyi kolaylaştıracak mimari seçimler

Sonrasında bu öneriler kullanıcıya sunulur. Kullanıcı, uygun gördüğü önerileri işaretler ve onaylar. Geliştirme süreci, yalnızca kullanıcı tarafından onaylanmış kapsam üzerinden başlar.

Bu sayede sistem pasif bir uygulayıcı değil, aktif bir teknik danışman ve yaratıcı geliştirme ortağı gibi davranır.

Projeye Başlamadan Önce Maliyet Tahmini ve İnsan Onayı
Bu sistemin temel ilkelerinden biri şudur:

Bir proje, tahmini maliyeti kullanıcıya gösterilmeden başlatılmaz.

Kullanıcı sisteme proje dokümanını verdikten, sistem projeyi analiz edip görevlerine ayırdıktan ve önerilerini sunduktan sonra, geliştirme başlamadan önce bir ön maliyet analizi yapılır.

Bu analizde sistem:

tahmini görev sayısını çıkarır, görevlerin zorluk seviyesini belirler, hangi görevlerde hangi model sınıfının kullanılacağını planlar, tahmini token tüketimini hesaplar, bu tokenin yaklaşık dolar karşılığını çıkarır, gerekiyorsa dış servis maliyetlerini de ayrı gösterir, olası revizyon ve test marjını belirtir

Kullanıcıya örneğin şu tip bir özet sunulur:

Tahmini toplam token tüketimi Tahmini model bazlı dağılım Tahmini dolar maliyeti Maliyet aralığı Yüksek belirsizlik içeren alanlar Dış servis gerekirse onların potansiyel ek maliyeti

Bundan sonra kullanıcı onay verirse geliştirme süreci başlar.

Bu çok önemlidir. Çünkü sistem yalnızca teknik olarak değil, ekonomik olarak da şeffaf ve kontrollü çalışmalıdır.

Claude’un Rolü: Merkezi Beyin
Bu ekosistemin beyni Claude’dur.

Claude’un temel görevleri şunlardır:

proje dokümanını anlamak görev ağacını çıkarmak eksikleri ve yaratıcı geliştirme fırsatlarını tespit etmek maliyet tahmini yapmak görevleri uzman alanlara ayırmak ajan atamak bağımlılıkları yönetmek ortak mimariyi korumak kaliteyi denetlemek insan girdisi gereken anları tespit etmek dış araç ve servis ihtiyaçlarını belirlemek revizyon taleplerini analiz etmek süreç boyunca verimlilik, uyum ve maliyet dengesini korumak

Burada kritik ilke şudur:

Claude bu sistemin merkezi zekâsıdır, ama her işi doğrudan kendi yapan tek araç değildir.

Claude, görevin doğasına göre başka modelleri, harici servisleri, build araçlarını ya da uzman sistemleri de devreye alabilir. Ama kontrol daima Claude’un yönettiği orkestrasyon katmanında kalır.

Uzman Ajan Mimarisi
Sistem tek bir genel amaçlı modelin lineer çalışması üzerine kurulmaz. Bunun yerine uzmanlaşmış ajanlardan oluşan bir yapı kullanır.

Bu ajanlar örneğin şunlar olabilir:

sistem mimarisi ajanı çekirdek motor ajanı rendering ajanı input ve event ajanı asset pipeline ajanı editor/UI ajanı script/runtime ajanı test ajanı entegrasyon ajanı build ve deployment ajanı revizyon ve bakım ajanı dokümantasyon ajanı operasyon ajanı

Her ajan yalnızca kendi uzmanlığındaki işi yapar. Ancak bu ajanlar birbirinden kopuk çalışmaz. Her biri:

görev kapsamını bilir, bağlı olduğu modülleri bilir, uyması gereken arayüzleri bilir, ortak mimari kararları bilir, proje standartlarını bilir, bitmişlik koşullarını bilir, diğer ajanlara zarar vermeden çalışmak zorundadır

Bu sayede sistem “çok ajanlı kaos” üretmez; çok ajanlı uyumlu üretim sağlar.

Ortak Mimari ve Proje Hafızası
Her ajan projeye yeni katılmış yabancı biri gibi davranmamalıdır. Bu yüzden sistemde merkezi bir proje hafızası bulunur.

Bu hafıza rastgele konuşma geçmişi değildir. Yapılandırılmış bir bilgi katmanıdır. Şunları içerir:

proje amacı onaylanan kapsam kullanıcı tarafından kabul edilen yaratıcı öneriler mimari kararlar modüller arası ilişkiler API sözleşmeleri kod standartları klasör yapısı geçmiş görev çıktıları revizyon geçmişi insanın yaptığı işlemler entegrasyon kayıtları test sonuçları maliyet ve token özetleri

Bu sayede ajanlar projeyi anlayarak hareket eder ve değişiklikler bağlamdan kopmadan uygulanır.

İş Akışı: Dokümandan Çalışan Ürüne
Sistem iş akışını şu şekilde yürütür:

Önce kullanıcı proje dokümanını verir. Sistem bunu analiz eder. Eksikleri ve yaratıcı fırsatları çıkarır. Kullanıcıya öneriler sunar. Kullanıcının işaretleyip onayladığı öneriler kapsamın parçası haline gelir. Ardından sistem toplam iş hacmini ve tahmini maliyeti çıkarır. İnsan onay verirse geliştirme başlar.

Sonrasında sistem:

projeyi görev bloklarına ayırır, bağımlılıkları belirler, her görev için uygun ajan atar, gerekli modeli seçer, görevleri sıraya koyar, çıktıları denetler, testleri çalıştırır, entegrasyonları yapar, gerekiyorsa insanı sürece dahil eder, ürünü tamamlar

Bu süreç düz bir hat değildir. Geri beslemeli, kontrollü ve ölçülebilir bir üretim döngüsüdür.

İnsan Kararı Değil, İnsan İşlemi Gereken Noktalar
Bu sistemde insan her aşamada aktif olmak zorunda değildir. Ancak bazı işler doğası gereği insan işlemi gerektirir.

Örneğin:

sunucu açmak, DNS kaydı girmek, API anahtarı almak, mağaza hesabı bağlamak, sertifika üretmek, bir panelde ayar yapmak, manuel doğrulama tamamlamak

gibi adımlar doğrudan insan eli ister.

Sistem bu durumda şöyle çalışır:

Yapay zekâ mümkün olan yere kadar ilerler. İnsan işlemi zorunlu hale geldiğinde süreç kontrollü şekilde durur. Kullanıcıya:

ne yapılması gerektiğini, neden gerektiğini, nasıl yapılacağını, tamamlandığını göstermek için ne verilmesi gerektiğini açıkça söyler.

İnsan işlemi tamamladıktan sonra sistem bunu doğrular ve bir sonraki zorunlu insan ihtiyacına kadar otonom biçimde çalışmaya devam eder.

Yani model şudur:

AI çalışır → insan işlemi gereken noktada durur → insan işlemi yapar → AI kaldığı yerden devam eder.

Entegrasyonlar Başta Değil, Gerektiğinde
Bu sistem tüm entegrasyonları başlangıçta zorunlu kılmaz. Bunun yerine gerektiğinde entegrasyon modeliyle çalışır.

Örneğin:

görsel üretim gerekmiyorsa image API gerekmez, mobil export aşamasına gelinmediyse signing altyapısı gerekmez, deploy yapılmayacaksa prod entegrasyonu gerekmez, mağazaya yayın yoksa store API’leri gerekmez

Sistem ihtiyaç anı geldiğinde kullanıcıdan ilgili entegrasyonu ister.

Ama bu istek yalnızca “API ver” şeklinde olmaz. Sistem şunu açıklar:

hangi servis gerekiyor neden gerekiyor bu servis ne iş için kullanılacak nasıl alınır sisteme nasıl bağlanır doğrulaması nasıl yapılır

Bu sayede sistem uygulanabilir ve kullanıcı dostu kalır.

Claude’un Dış Yetenekleri Devreye Alması
Claude bu sistemin beynidir. Ama gerektiğinde başka yapay zekâları ve servisleri devreye alabilir.

Örneğin:

görsel üretimi için dış image modeli, ses veya müzik için audio modeli, özel OCR için başka servis, build işlemleri için toolchain, mağaza yayınlama için platform API’leri, özel analiz için başka uzman sistemler

kullanılabilir.

Claude burada tek başına her işi yapan model değil; ihtiyaç halinde doğru uzman yeteneği seçen merkezi orkestratör olarak hareket eder.

Görev Bazlı En Ucuz Uygun Model Seçimi
Bu sistemin maliyet verimliliği için temel ilkelerinden biri şudur:

Bir görev hangi modelle kalite kaybı olmadan yapılabiliyorsa, o görev için mümkün olan en ucuz uygun model kullanılmalıdır.

Örneğin Claude model ailesi içinde:

basit sınıflandırma, görev ayrıştırma, özet çıkarma, standart kod düzenleme, düşük riskli refactor, formatlama, basit test üretimi

gibi işler daha düşük maliyetli modelle kalite kaybı olmadan yapılabiliyorsa, sistem o görevlerde en pahalı modeli kullanmaz.

Daha güçlü model yalnızca gerçekten gerektiğinde devreye alınır:

karmaşık mimari kararlar, zor entegrasyonlar, geniş bağlam analizi, yüksek riskli revizyonlar, sistem çapında etki analizi

Bu sayede sistem yalnızca akıllı değil, maliyet zekâsına sahip bir yapı haline gelir.

Token Verimliliği: Zorunlu Mimari İlke
Bu sistem için token verimliliği bir optimizasyon değil, zorunluluktur.

Bunun için sistem:

her ajana yalnızca gerekli bağlamı verir, bağlamı katmanlı tutar, proje hafızasını sıkıştırılmış biçimde kullanır, tekrar eden analizleri yeniden üretmez, gereksiz ajan çağrısı yapmaz, revizeleri yalnızca etkilediği alanlarda işler, yapılandırılmış çıktı formatı kullanır, görev başına token bütçesi izler, model bazlı maliyeti takip eder

Hedef yalnızca üretmek değil; ekonomik olarak sürdürülebilir biçimde üretmektir.

Revizyon Mimarisi
Gerçek projelerde kritik olan sadece ilk sürüm değil, revizelerdir.

Kullanıcı bir modülü beğenmediğinde sistem tüm ajanları yeniden çağırmaz. Bunun yerine:

revize talebini analiz eder, etki alanını belirler, yalnızca ilgili ajanları çağırır, gerekiyorsa bağlantılı modüllerde ek görev açar, değişikliği kontrollü uygular, ilgili testleri çalıştırır, sistemin geri kalanını korur

Revizyon ajanları projeye yabancı davranmaz. Projenin bağlamını bilen bakım mühendisleri gibi çalışır.

Güvenli Değişiklik İlkesi
Her değişiklik minimum gerekli etkiyle yapılmalıdır.

Sistem şu prensiple çalışır:

Mümkün olan en küçük güvenli değişiklik yapılmalı, çalışan kısımlar gereksiz yere bozulmamalı ve her değişiklik etki analiziyle yönetilmelidir.

Bu yüzden sistem:

diff tabanlı çalışır, çalışma alanlarını izole eder, değişiklik alanını sınırlar, hedefli testler çalıştırır, rollback imkânı sunar, stabil ve deneysel sürümü ayırır 16. Gözlemlenebilirlik ve Kontrol

Sistem görünür olmak zorundadır. Kullanıcı ya da operatör şunları görebilmelidir:

hangi ajan çalışıyor, hangi görev bitti, hangi görev bekliyor, hangi noktada insan girdisi gerekiyor, hangi entegrasyon eksik, hangi model hangi görevde kullanılıyor, ne kadar token harcandı, tahmini bütçeden ne kadar sapıldı, hangi testler geçti, sistem neden durdu

Bu yüzden sistemde görev durumu, ajan log’ları, test sonuçları, maliyet dashboard’ları ve hata raporları bulunur.

Gerçek Dünya Araç Entegrasyonları
Bu sistem soyut bir AI ağı değildir. Gerçek üretim yapabilmesi için gerçek araçlarla entegre çalışır.

Bunlar arasında:

Git ve repository yönetimi CI/CD sistemleri container altyapısı veritabanı ve kuyruk sistemleri object storage auth sistemleri WebSocket altyapısı secret management test runner’lar build toolchain’leri mobil export araçları mağaza yayın servisleri görsel ve ses üretim API’leri deploy araçları log ve monitoring sistemleri

yer alabilir.

Ancak bunların tamamı yalnızca ihtiyaç doğduğunda devreye alınır.

Güvenlik ve Yetki Yönetimi
Bu ekosistem gerçek araçlar ve gerçek sunucularla çalışacağı için güvenlik çekirdek bileşendir.

Sistemde:

rol bazlı yetkilendirme, ajan bazlı izin sınırları, secret isolation, tool-level policy, kontrollü komut çalıştırma, branch ve workspace izolasyonu, audit log, rollback ve sürümleme

bulunmalıdır.

Bu sayede sistem yalnızca üretken değil, aynı zamanda güvenli olur.

Tamamlanmışlık Tanımı
Bu sistemde “iş bitti” demek yalnızca kod yazıldı demek değildir.

Bir görevin tamamlandığını söylemek için:

kodun derlenmesi, testlerin geçmesi, modüller arası uyumun korunması, işlevin gerçekten çalışması, gerekiyorsa dokümantasyonun üretilmesi, build/export çıktısının oluşması, performans kriterlerinin karşılanması

gerekir.

Amaç yalnızca çıktı vermek değil, doğrulanmış ürün teslim etmektir.

Örnek Senaryo
Kullanıcı sisteme bir 2D oyun motoru dokümanı verir.

Sistem dokümanı analiz eder. Eksik alanları ve yaratıcı geliştirme fırsatlarını çıkarır. Kullanıcıya örneğin:

debug paneli, profiler ekranı, undo/redo sistemi, asset atlas optimizasyonu, script hata ayıklama, daha modüler export yapısı gibi öneriler sunar.

Kullanıcı bunlardan bazılarını seçer. Sistem onaylanan kapsamı oluşturur. Ardından tahmini token tüketimini ve dolar maliyetini çıkarır. Kullanıcı maliyeti onaylar.

Sonra Claude görevleri çıkarır, ajanları atar ve geliştirme başlar.

İlerleyen aşamada bir görsel üretim API’si gerekir. Sistem neden gerektiğini açıklar, nasıl alınacağını anlatır, kullanıcı entegrasyonu sağlar, sistem doğrular ve devam eder.

Daha sonra Android export aşamasında signing gerekir. Sistem yine durur, gerekli insan işlemini ister, doğrular ve devam eder.

Motor tamamlandığında kullanıcı editor panelinin bir bölümünü beğenmez. Sistem tüm projeyi yeniden işletmez. Sadece ilgili ajanları çağırır, etki analizi yapar, revizeyi uygular, test eder ve teslim eder.

Sonuçta kullanıcıya çalışan, revize edilebilir, kontrollü maliyetle üretilmiş, gerçek bir ürün verilir.

Bu Sistemin Farkı Nedir
Bu sistemin farkı şudur:

Bu, tek bir yapay zekânın büyük bir cevap üretmesi değildir. Bu, Claude merkezli, maliyet farkındalığına sahip, yaratıcı öneri sunabilen, uzman ajanları yöneten, insanı yalnızca gerektiğinde devreye alan ve sonunda gerçek ürün üreten bir dijital geliştirme organizasyonudur.

Bu sistem:

projeyi anlar, eksikleri bulur, yaratıcı öneriler sunar, insan onayıyla kapsamı netleştirir, maliyeti önceden hesaplar, görevleri çıkarır, uzman ajan atar, en ucuz uygun modeli seçer, gerektiğinde dış araçları devreye alır, insan işlemi gereken yerde durur, revizeleri seçici şekilde yönetir, token verimliliğini korur, gerçek araçlarla entegre olur, sonunda çalışan ürün üretir

Yani burada amaç “AI ile biraz kod yazmak” değil; AI ile gerçek yazılım geliştirme süreçlerini otonomlaştırmaktır.

Sonuç
Özetle bu sistemin iddiası şudur:

Claude’u yalnızca güçlü bir model olarak değil, uzman ajanları, harici araçları, diğer yapay zekâları, insan işlemlerini ve gerçek dünya entegrasyonlarını yöneten merkezi bir beyin olarak konumlandırıyoruz. Kullanıcı proje dokümanını verir; sistem projeyi anlar, eksikleri ve yaratıcı fırsatları tespit eder, önerilerini sunar, kullanıcı onayıyla kapsamı netleştirir, maliyeti önceden hesaplar, görevleri uzman ajanlara böler, uygun maliyetli modelleri seçer, ihtiyaç duyulana kadar otonom çalışır, gerektiğinde insanı veya harici servisleri doğru anda devreye alır ve sonunda çalışan, revize edilebilir, sürdürülebilir ve ekonomik biçimde üretilmiş bir yazılım ürünü teslim eder.

Bu yaklaşım yapay zekâyı bir sohbet aracından çıkarır ve gerçek bir üretim ekosistemine dönüştürür.

Ve en önemli nokta şudur:

Amaç tek seferde yanıt vermek değil, eksiksiz şekilde ürün üretmektir.
