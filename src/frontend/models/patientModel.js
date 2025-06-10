export const registerPatient = async (data) => {
  try {
    const response = await fetch("/api/patients/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    // Si el status NO es 2xx (201, 200), lanzamos error
    if (!response.ok) {
      throw new Error(
        responseData.error || "Error en la respuesta del servidor"
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error en registerPatient:", error);
    return { error: error.message || "Error inesperado" };
  }
};
