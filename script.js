

class Carrito {
    constructor() {
        this.productos = []; // Array para almacenar los productos del carrito
        this.divisa = "€"; // Divisa utilizada en el carrito
    }

    // Método para añadir o actualizar un producto en el carrito
    agregarProducto(id, titulo, precio, cantidad = 1) {
        precio = parseFloat(precio); // Asegura que precio sea un número
        const productoExistente = this.productos.find(producto => producto.id === id);
        
        if (productoExistente) {
            // Si el producto ya está en el carrito, solo actualiza la cantidad
            productoExistente.cantidad += cantidad;
        } else {
            // Si el producto no está en el carrito, añádelo con el precio en formato numérico
            this.productos.push({ id, titulo, precio, cantidad });
        }
    }

    // ... (resto de métodos)



    actualizarUnidades(id, unidades) {
        const producto = this.productos.find(producto => producto.id === id);
        if (producto) {
            producto.cantidad = unidades;
        }
    }

    obtenerInformacionProducto(id) {
        const producto = this.productos.find(producto => producto.id === id);
        return producto ? { ...producto, precio: producto.precio.toFixed(2) + this.divisa } : null;
    }

    obtenerCarrito() {
        const total = this.productos.reduce((acumulador, producto) => 
            acumulador + (producto.precio * producto.cantidad), 0
        ).toFixed(2);

        return {
            total: total,
            divisa: this.divisa,
            productos: this.productos.filter(producto => producto.cantidad > 0)
        };
    }
}



document.addEventListener("DOMContentLoaded", function(event) { 
    const tablaProductos = document.getElementById("cuerpoTabla"); 
    const totalFinal = document.getElementById("totalFinal"); 
    const carrito = new Carrito(); 

    function cargarProductosEnTabla(productos) {
        tablaProductos.innerHTML = ""; 

        productos.forEach(producto => {
            const fila = document.createElement("tr");
            

            // Nombre y referencia del producto
            const celdaTitulo = document.createElement("td");
            celdaTitulo.innerHTML = `
                ${producto.titulo}<br>
                <span class="referencia">Referencia: ${producto.id}</span>
            
            
            `;

            // Controles de cantidad (botones)
            const celdaCantidad = document.createElement("td");
            const cantidadContainer = document.createElement("div");
            cantidadContainer.classList.add("cantidad-control");

            const botonDecrementar = document.createElement("button");
            botonDecrementar.classList.add("decrementar");
            botonDecrementar.textContent = "-";
            botonDecrementar.dataset.id = producto.id;

            const spanCantidad = document.createElement("span");
            spanCantidad.classList.add("cantidad-texto");
            spanCantidad.dataset.id = producto.id;
            spanCantidad.textContent = producto.cantidad;

            const botonIncrementar = document.createElement("button");
            botonIncrementar.classList.add("incrementar");
            botonIncrementar.textContent = "+";
            botonIncrementar.dataset.id = producto.id;

            cantidadContainer.appendChild(botonDecrementar);
            cantidadContainer.appendChild(spanCantidad);
            cantidadContainer.appendChild(botonIncrementar);
            celdaCantidad.appendChild(cantidadContainer);

            // Precio y total del producto
            const celdaPrecio = document.createElement("td");
            celdaPrecio.textContent = `${producto.precio.toFixed(2)}€`;

            const celdaTotal = document.createElement("td");
            celdaTotal.classList.add("producto-total");
            celdaTotal.textContent = `${(producto.cantidad * producto.precio).toFixed(2)}€`;

            fila.appendChild(celdaTitulo);
            fila.appendChild(celdaCantidad);
            fila.appendChild(celdaPrecio);
            fila.appendChild(celdaTotal);

            tablaProductos.appendChild(fila);
        });

        actualizarTotal();
    }

    function actualizarTotal() {
        const { total, productos } = carrito.obtenerCarrito();
        
        // Generar el ticket de compra escalonado
        const detalleProductos = productos
            .map(producto => `${producto.cantidad} x ${producto.titulo}`)
            .join('<br>');

        // Actualizar el contenido de totalFinal para reflejar el ticket de compra
        totalFinal.innerHTML = `
            <br>
            ${detalleProductos}<br><br>
            Precio <br>
            Total: ${total}€
        `;
    }

    // Evento para actualizar cantidades cuando el usuario cambia el valor en los botones de cantidad
    tablaProductos.addEventListener("click", function(event) {
        const id = event.target.dataset.id;
        const spanCantidad = tablaProductos.querySelector(`.cantidad-texto[data-id="${id}"]`);

        if (event.target.classList.contains("incrementar")) {
            carrito.actualizarUnidades(id, parseInt(spanCantidad.textContent) + 1);
            spanCantidad.textContent = parseInt(spanCantidad.textContent) + 1;
        } else if (event.target.classList.contains("decrementar")) {
            const nuevaCantidad = parseInt(spanCantidad.textContent) - 1;
            carrito.actualizarUnidades(id, nuevaCantidad > 0 ? nuevaCantidad : 0);
            spanCantidad.textContent = nuevaCantidad > 0 ? nuevaCantidad : 0;
        }

        actualizarFilaYTotal(id);
    });

    function actualizarFilaYTotal(id) {
        const productoInfo = carrito.obtenerInformacionProducto(id);
    
        // Busca la fila del producto usando un selector válido
        const filaTotal = tablaProductos.querySelector(`.cantidad-texto[data-id="${id}"]`)
            .closest("tr").querySelector(".producto-total");
    
        // Asegura que el precio se trate como número en los cálculos
        if (filaTotal && productoInfo) {
            const precio = parseFloat(productoInfo.precio);
            filaTotal.textContent = `${productoInfo.cantidad > 0 ? (precio * productoInfo.cantidad).toFixed(2) : "0"}€`;
        }
    
        actualizarTotal();
    }
    

    fetch('https://jsonblob.com/api/1301248138034405376')
        .then(response => response.json())
        .then(data => {
            const productos = data.products.map(producto => ({
                id: producto.id,
                titulo: producto.título,
                precio: parseFloat(producto.precio),
                cantidad: 1 
            }));

            productos.forEach(prod => carrito.agregarProducto(prod.id, prod.titulo, prod.precio, prod.cantidad));
            cargarProductosEnTabla(carrito.productos);
        })
        .catch(error => console.error("Error al obtener los productos:", error));
});
