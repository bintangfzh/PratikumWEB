const products = [
    { id: 1, nama: "Nasi Goreng Spesial", harga: 25000, stok: 10 },
    { id: 2, nama: "Ayam Bakar Madu", harga: 30000, stok: 6 },
    { id: 3, nama: "Mie Goreng Seafood", harga: 28000, stok: 8 },
    { id: 4, nama: "Sate Ayam (10 Tusuk)", harga: 22000, stok: 5 },
    { id: 5, nama: "Es Teh Manis Jumbo", harga: 6000, stok: 15 },
    { id: 6, nama: "Es Jeruk Peras", harga: 8000, stok: 12 }
];

let cart = [];
function renderProducts() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.setAttribute("data-name", product.nama.toLowerCase());

        const title = document.createElement("h3");
        const titleText = document.createTextNode(product.nama);
        title.appendChild(titleText);

        const price = document.createElement("p");
        price.className = "price";
        const priceText = document.createTextNode(`Rp ${product.harga.toLocaleString('id-ID')}`);
        price.appendChild(priceText);

        const stock = document.createElement("p");
        stock.className = "stock";
        const stockText = document.createTextNode(`Tersedia: ${product.stok} porsi`);
        stock.appendChild(stockText);

        const btn = document.createElement("button");
        btn.className = "btn-primary";
        const btnText = document.createTextNode("+ Tambah Pesanan");
        btn.appendChild(btnText);
        
        btn.addEventListener("click", function() {
            addToCart(product.id);
        });

        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(stock);
        card.appendChild(btn);
        productList.appendChild(card);
    });
}

$(document).ready(function() {
    renderProducts();

    $("#toggle-cart-btn").click(function() {
        $("#cart-panel").fadeToggle(300);
    });

    $("#search-input").on("keyup", function() {
        let value = $(this).val().toLowerCase();
        $(".product-card").filter(function() {
            $(this).toggle($(this).attr("data-name").indexOf(value) > -1);
        });
    });

    window.addToCart = function(productId) {
        let product = products.find(p => p.id === productId);

        if (product.stok <= 0) {
            alert(`Maaf, porsi ${product.nama} sudah habis!`);
            return;
        }
        product.stok--;
        renderProducts();
        let cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.qty++;
        } else {
            cart.push({
                id: product.id,
                nama: product.nama,
                harga: product.harga,
                qty: 1
            });
        }
        updateCartUI(productId);
    };

    function updateCartUI(newProductId = null) {
        let totalItems = 0;
        let totalPrice = 0;
        $("#cart-items").empty(); 
        cart.forEach(item => {
            totalItems += item.qty;
            totalPrice += item.harga * item.qty;
            let itemElement = $(`
                <div class="cart-item" data-id="${item.id}">
                    <div>
                        <strong>${item.nama}</strong><br>
                        <small>${item.qty} porsi x Rp ${item.harga.toLocaleString('id-ID')}</small>
                    </div>
                    <div>
                        <span style="font-weight:bold; margin-right:10px;">Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</span>
                        <button class="btn-danger remove-btn" onclick="removeFromCart(${item.id})">Hapus</button>
                    </div>
                </div>
            `);
            $("#cart-items").append(itemElement);
            if (item.id === newProductId) {
                itemElement.hide().fadeIn(400);
            }
        });

        $("#cart-count").text(totalItems);
        $("#cart-total").text(totalPrice.toLocaleString('id-ID'));
    }

    window.removeFromCart = function(productId) {
        if (confirm("Apakah Anda yakin ingin membatalkan menu ini dari pesanan?")) {
            let cartIndex = cart.findIndex(item => item.id === productId);
            if (cartIndex !== -1) {
                let item = cart[cartIndex];
                let product = products.find(p => p.id === productId);
                product.stok += item.qty;
                renderProducts();

                $(`.cart-item[data-id="${productId}"]`).fadeOut(400, function() {
                    $(this).remove();
                    cart.splice(cartIndex, 1);
                    updateCartUI();
                });
            }
        }
    };

    $("#clear-cart-btn").click(function() {
        if (cart.length === 0) return;
        if (confirm("Apakah Anda yakin ingin mengosongkan seluruh daftar pesanan?")) {
            cart.forEach(item => {
                let product = products.find(p => p.id === item.id);
                if (product) product.stok += item.qty;
            });
            cart = [];
            renderProducts();

            $("#cart-items").children().fadeOut(400, function() {
                $("#cart-items").empty();
                updateCartUI();
            });
        }
    });

    $("#checkout-btn").click(function() {
        if (cart.length === 0) {
            alert("Keranjang pesanan Anda masih kosong!");
            return;
        }
        let namaPembeli = prompt("Masukkan nama pemesan / nomor meja:");
        if (namaPembeli && namaPembeli.trim() !== "") {
            let total = 0;
            let listHtml = "<ul>";
            
            cart.forEach(item => {
                let subtotal = item.harga * item.qty;
                total += subtotal;
                listHtml += `<li>${item.nama} (${item.qty} porsi) - Rp ${subtotal.toLocaleString('id-ID')}</li>`;
            });
            listHtml += "</ul>";

            let summaryHtml = `
                <h3>Struk Ringkasan Pesanan</h3>
                <p><strong>Atas Nama / Meja:</strong> ${namaPembeli}</p>
                <p><strong>Menu Pesanan:</strong></p>
                ${listHtml}
                <p><strong>Total Bayar:</strong> Rp ${total.toLocaleString('id-ID')}</p>
                <p style="margin-top:8px;"><em>Pesanan Anda sedang diproses oleh dapur. Selamat menikmati! 🍽️</em></p>
            `;
            $("#checkout-summary").html(summaryHtml).fadeIn(500);
            cart = [];
            updateCartUI();
        } else if (namaPembeli !== null) {
            alert("Nama pemesan tidak boleh kosong!");
        }
    });
});