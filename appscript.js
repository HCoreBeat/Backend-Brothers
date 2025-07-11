function doPost(e) {
  let data;
  try {
    // Intenta parsear los datos JSON del cuerpo de la solicitud POST.
    data = JSON.parse(e.postData.contents);
    Logger.log('✅ Datos recibidos y parseados correctamente: ' + JSON.stringify(data));
  } catch (error) {
    // Si hay un error al parsear el JSON, registra el error y devuelve una respuesta de error.
    Logger.log('❌ Error al parsear los datos JSON: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Error al parsear los datos JSON." })).setMimeType(ContentService.MimeType.JSON);
  }

  // --- Configuración del correo ---
  // Dirección de correo donde se enviarán las órdenes de pedido internas. ¡Asegúrate de que sea correcta!
  const destinatario = "soporte.brothershop@gmail.com"; // Considera cambiar a un correo de Brothers
  // Asunto claro y directo para una orden de pedido interna.
  const asunto = "✨ NUEVA ORDEN DE PEDIDO URGENTE - Brothers ✨"; // Asunto más conciso

  // --- Extracción y Asignación de Datos del Pedido ---
  const pais = data.pais || "N/A";
  const origen = data.origen || "N/A";
  const afiliado = data.afiliado || "Ninguno";
  const nombreComprador = data.nombre_comprador || "Desconocido";
  const telefonoComprador = data.telefono_comprador || "N/A";
  const correoComprador = data.correo_comprador || "N/A";
  const direccionEnvio = data.direccion_envio || "N/A";
  const compras = data.compras || [];
  const precioCompraTotal = parseFloat(data.precio_compra_total || "0.00").toFixed(2);
  const navegador = data.navegador || "Desconocido";
  const sistemaOperativo = data.sistema_operativo || "Desconocido";
  const fuenteTrafico = data.fuente_trafico || "Directo";

  // Formatea la fecha del pedido a un formato legible y completo.
  const fechaPedidoRaw = data.fecha_pedido;
  let fechaPedidoFormateada = "N/A";
  if (fechaPedidoRaw) {
    try {
      // Formato más completo y legible
      fechaPedidoFormateada = new Date(fechaPedidoRaw).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
    } catch (e) {
      Logger.log('❌ Error al formatear la fecha del pedido: ' + e.message);
      fechaPedidoFormateada = "Fecha inválida";
    }
  }

  // Genera un número de pedido único.
  const numeroPedido = `ORD-${Date.now().toString(36).toUpperCase()}`;

  // --- Preparación del Contenido HTML de la Tabla de Artículos ---
  let itemsTableRows = '';
  if (Array.isArray(compras) && compras.length > 0) {
    compras.forEach(item => {
      const itemName = item.name || 'Producto Desconocido';
      const itemQuantity = parseInt(item.quantity) || 0;
      const itemUnitPrice = (item.unitPrice !== undefined && item.unitPrice !== null) ? parseFloat(item.unitPrice).toFixed(2) : '0.00';
      const itemTotalPrice = (parseFloat(itemUnitPrice) * itemQuantity).toFixed(2);

      itemsTableRows += `
        <tr style="background-color: #ffffff; transition: background-color 0.3s ease;">
          <td style="padding: 14px; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #333333; text-align: left;">${itemName}</td>
          <td style="padding: 14px; border-bottom: 1px solid #e0e0e0; text-align: center; font-size: 14px; color: #333333;">${itemQuantity}</td>
          <td style="padding: 14px; border-bottom: 1px solid #e0e0e0; text-align: right; font-size: 14px; color: #333333;">$${itemUnitPrice}</td>
          <td style="padding: 14px; border-bottom: 1px solid #e0e0e0; text-align: right; font-size: 14px; color: #333333;">$${itemTotalPrice}</td>
        </tr>
      `;
    });
  } else {
    itemsTableRows += `
      <tr style="background-color: #ffffff;">
        <td colspan="4" style="padding: 14px; border-bottom: 1px solid #e0e0e0; text-align: center; font-size: 14px; color: #555555; font-style: italic;">No se especificaron productos en este pedido.</td>
      </tr>
    `;
  }

  // --- Definición de variables CSS (colores y otros) para usar en el HTML ---
  const doradoClaro = "#FFD700"; // Oro clásico para acentos brillantes
  const doradoMedio = "#ebc451"; // Goldenrod - Dorado más fuerte para cabeceras de tabla/total
  const doradoOscuro = "#C8A131"; // DarkGoldenrod - Para detalles y énfasis
  const negroFondo = "#000000"; // Negro puro para el fondo del header
  const grisFondoExterior = "#F5F5F5"; // Gris muy claro, casi blanco para el fondo general
  const grisFondoInterior = "#FAFAFA"; // Ligeramente más oscuro que el exterior para contraste sutil
  const grisTextoPrincipal = "#333333"; // Texto principal
  const grisTextoSecundario = "#666666"; // Texto secundario
  const blanco = "#FFFFFF";
  const gradienteHeader = "linear-gradient(to right, #000000, #333333)"; // Gradiente para el header
  const sombraSuave = "0 6px 18px rgba(0,0,0,0.15)"; // Sombra más prominente

  const logoBrothers = "https://raw.githubusercontent.com/HCoreBeat/Brothers/main/Images/logoBase.png"; // URL directa de la imagen raw de GitHub

  // --- Construcción del Mensaje HTML Completo ---
  const mensajeHTML = `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 16px; line-height: 1.7; background-color: ${grisFondoExterior}; padding: 40px 0; color: ${grisTextoPrincipal};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 700px; margin: 0 auto; background-color: ${blanco}; border-radius: 16px; overflow: hidden; box-shadow: ${sombraSuave}; border: 1px solid #e0e0e0;">
        <tr>
          <td style="padding: 40px; background: ${gradienteHeader}; text-align: center; border-bottom: 4px solid ${doradoClaro};">
            <img src="${logoBrothers}" alt="Brothers Logo" style="max-width: 310px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; filter: drop-shadow(0 0 12px rgba(255,215,0,0.7));">
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 50px; background-color: ${grisFondoInterior};">
            <h1 style="font-size: 30px; color: ${grisTextoPrincipal}; text-align: center; margin-bottom: 25px; font-weight: 700; border-bottom: 1px dashed #dddddd; padding-bottom: 15px;">¡Nueva Orden Recibida!</h1>
            <p style="text-align: center; color: ${grisTextoSecundario}; font-size: 17px; margin-bottom: 30px;">
              Tenemos una nueva orden de pedido que requiere su atención inmediata. Revise los detalles a continuación.
            </p>
            <p style="text-align: center; font-weight: bold; font-size: 26px; color: ${doradoOscuro}; margin-top: 25px; background-color: #fff8e1; padding: 2px 20px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 6px rgba(0,0,0,0.1); border: 1px solid #ffecb3;">
              Número de Pedido: ${numeroPedido}
            </p>
            <p style="text-align: center; font-weight: bold; font-size: 15px; color: ${doradoOscuro}; margin-top: 25px; background-color: #fff8e1; padding: 2px 20px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 6px rgba(0,0,0,0.1); border: 1px solid #ffecb3;">
              Fecha y Hora del Pedido: ${fechaPedidoFormateada}
            </p>

            <hr style="border: 0; border-top: 2px dashed #eeeeee; margin: 40px 0;">

            <h2 style="font-size: 24px; color: ${doradoMedio}; margin-bottom: 20px; font-weight: 600;">Información del Cliente y Envío</h2>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px; border-radius: 8px; overflow: hidden; background-color: ${blanco}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <tr>
                <td style="padding: 20px; line-height: 1.8; border: 1px solid #e0e0e0;">
                  <strong style="color: ${doradoOscuro};">Nombre del Comprador:</strong> ${nombreComprador}<br>
                  <strong style="color: ${doradoOscuro};">Dirección de Envío:</strong> ${direccionEnvio}<br>
                  <strong style="color: ${doradoOscuro};">País de Compra:</strong> ${pais}<br>
                  <strong style="color: ${doradoOscuro};">Correo del Comprador:</strong> <a href="mailto:${correoComprador}" style="color: #007bff; text-decoration: none; font-weight: 500;">${correoComprador}</a><br>
                  <strong style="color: ${doradoOscuro};">Teléfono del Comprador:</strong> ${telefonoComprador}<br>
                  <strong style="color: ${doradoOscuro};">Afiliado:</strong> ${afiliado}
                </td>
              </tr>
            </table>

            <h2 style="font-size: 24px; color: ${doradoMedio}; margin-bottom: 20px; font-weight: 600;">Detalles de la Orden</h2>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 30px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <thead>
                <tr style="background-color: ${doradoMedio}; color: ${blanco}; text-align: left;">
                  <th style="padding: 16px; font-size: 15px; border-bottom: 1px solid ${doradoOscuro};">Artículo</th>
                  <th style="padding: 16px; text-align: center; font-size: 15px; border-bottom: 1px solid ${doradoOscuro};">Cantidad</th>
                  <th style="padding: 16px; text-align: right; font-size: 15px; border-bottom: 1px solid ${doradoOscuro};">Precio Unitario</th>
                  <th style="padding: 16px; text-align: right; font-size: 15px; border-bottom: 1px solid ${doradoOscuro};">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTableRows}
              </tbody>
              <tfoot>
                <tr style="background-color: ${grisFondoInterior};">
                  <td colspan="3" style="padding: 18px; text-align: right; font-weight: bold; font-size: 17px; color: ${grisTextoPrincipal};">Subtotal:</td>
                  <td style="padding: 18px; text-align: right; font-weight: bold; font-size: 17px; color: ${grisTextoPrincipal};">$${precioCompraTotal}</td>
                </tr>
                <tr style="background-color: ${doradoOscuro}; color: ${blanco};">
                  <td colspan="3" style="padding: 20px; text-align: right; font-weight: bold; font-size: 22px; letter-spacing: 0.5px;">TOTAL DEL PEDIDO:</td>
                  <td style="padding: 20px; text-align: right; font-weight: bold; font-size: 22px; letter-spacing: 0.5px;">$${precioCompraTotal}</td>
                </tr>
              </tfoot>
            </table>

            <h2 style="font-size: 24px; color: ${doradoMedio}; margin-bottom: 20px; font-weight: 600;">Información de Origen</h2>
            <ul style="list-style-type: none; padding: 0; margin-bottom: 30px; background-color: ${blanco}; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
              <li style="margin-bottom: 10px;"><strong>URL de Origen:</strong> <a href="${origen}" style="color: #007bff; text-decoration: none; font-weight: 500;">${origen}</a></li>
              <li style="margin-bottom: 10px;"><strong>Navegador del Cliente:</strong> ${navegador}</li>
              <li style="margin-bottom: 10px;"><strong>Sistema Operativo del Cliente:</strong> ${sistemaOperativo}</li>
              <li><strong>Fuente de Tráfico:</strong> ${fuenteTrafico}</li>
            </ul>

            <hr style="border: 0; border-top: 2px dashed #eeeeee; margin: 40px 0;">

            <p style="font-size: 15px; color: ${grisTextoSecundario}; text-align: center; margin-bottom: 20px;">
              Por favor, procese esta orden con la máxima prioridad. Agradecemos su diligencia.
            </p>
            <p style="font-size: 13px; color: ${grisTextoSecundario}; text-align: center;">
              Este es un correo de notificación automática enviado por el sistema de pedidos de Brothers.
            </p>
            <p style="font-size: 12px; color: ${grisTextoSecundario}; text-align: center; margin-top: 15px;">
              © 2025 Brothers. Todos los derechos reservados.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;

  // --- Lógica de envío y manejo de errores ---
  try {
    MailApp.sendEmail({
      to: destinatario,
      subject: asunto,
      htmlBody: mensajeHTML
    });

    Logger.log(`✅ Orden de pedido de Brothers enviada con éxito a: ${destinatario}`);
    // Devuelve una respuesta JSON al backend indicando éxito
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Orden de pedido enviada con éxito a Google Apps Script." })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(`❌ Error al enviar la orden de pedido de Brothers a ${destinatario}: ${error.message}`);
    // Devuelve una respuesta JSON al backend indicando error
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: `Error al enviar el correo: ${error.message}` })).setMimeType(ContentService.MimeType.JSON);
  }
}