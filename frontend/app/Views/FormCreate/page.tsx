"use client";
import React, { SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { AxiosResponse } from "axios";
import { useState, useEffect } from "react";
import "tailwindcss/tailwind.css";
import validate from "@/app/Handlers/validation";
import axios from "axios";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import Navbar from "@/app/components/Navbar/Navbar";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent } from "react";
import { Post } from "@/redux/services/getPost";
import { error } from "console";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { authenticateUserWithTokenAsync } from "@/redux/features/UserSlice";

export interface Errors {
  days: string;
  condition: string;
  type: string;
  images: string[];
  title: string;
  country: string;
  city: string;
  streetName: string;
  streetNumber: string | number;
  floorNumber: string | number;
  aptNumber: string;
  price: string | number;
  description: string;
  [key: string]: string | string[] | number | null;
}

export interface Values {
  days: number | null;
  type: string;
  condition: string;
  title: string;
  country: string;
  city: string;
  streetName: string;
  streetNumber: string;
  floorNumber: number;
  aptNumber: string;
  price: number;
  description: string;
  images: string[];
}

export default function Formulario() {
  //Estados
  const router = useRouter();

  const [focused, setFocused] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [files, setFile] = useState([]);
  const [errors, setErrors] = useState<Errors>({
    days: "",
    condition: "",
    type: "",
    images: [],
    title: "",
    country: "",
    city: "",
    streetName: "",
    streetNumber: "",
    floorNumber: "",
    aptNumber: "",
    price: "",
    description: "",
  });
  const [values, setValues] = useState<Values>({
    days: null,
    condition: "",
    type: "",
    images: [],
    title: "",
    country: "",
    city: "",
    streetName: "",
    streetNumber: "",
    floorNumber: 0,
    aptNumber: "",
    price: 0,
    description: "",
  });

  //Dropzone
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "image/png": [".png"],
        "image/jpg": [".jpg"],
        "image/jpeg": [".jpeg"],
      },
      multiple: true,
      onDrop: (files) => {
        // Aquí puedes manejar las imágenes aceptadas
        handleImages(files);
      },
    });

  //Disable

  const disable = (errors: Errors): boolean => {
    for (let fieldName in errors) {
      const errorValue = errors[fieldName];
      if (typeof errorValue === "string" && errorValue.length !== 0) {
        // Si es una cadena y no está vacía, habilita el botón
        return true;
      }
    }
    // Si no encuentra ningún campo con error, deshabilita el botón
    return false;
  };
  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
    setErrors(
      validate({
        ...values,
        [event.target.name]: event.target.value,
      })
    );
  }

  //Handlers
  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    // Solo aplica parseInt en campos numéricos
    if (["days", "floorNumber", "price"].includes(name)) {
      setValues({
        ...values,
        [name]: value === "" ? null : parseInt(value, 10),
      });
    } else {
      setValues({ ...values, [name]: value });
    }
    setErrors(
      validate({
        ...values,
        [event.target.name]: value,
      })
    );
  }

  async function handleImages(files: File[]): Promise<void> {
    try {
      const newImages = await Promise.all(
        files.map(async (file) => {
          const formFile = new FormData();
          formFile.append("files", file);
          let response: AxiosResponse;

          try {
            response = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/upload`,
              formFile
            );
            return response.data; // Asume que newImages es una matriz de cualquier tipo, ya que no proporcionaste información sobre su tipo.
          } catch (error) {
            console.error("Error al realizar la solicitud POST:", error);
            throw error; // Propaga el error para que sea manejado en el bloque catch externo
          }
        })
      );

      console.log(newImages);

      setValues((prevValues) => ({
        ...prevValues,
        images: [...prevValues.images, ...newImages],
      }));

      setErrors(
        validate({
          ...values,
          images: [...values.images, ...newImages],
        })
      );
    } catch (error) {
      // Maneja el error de manera adecuada, si es necesario
      console.error(error);
    }
  }

  type ValidateFunction = (input: Post) => Errors;

  // Define el tipo para la función handleSubmit
  type SubmitFunction = (
    event: SyntheticEvent,
    values: Values
  ) => Promise<void>;

  const handleSubmit: SubmitFunction = async (event, values) => {
    event.preventDefault();
    const formErrors = validate(values);
    setErrors(formErrors);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`,
        values
      );

      console.log("respuesta de la solicitud post:", response.data);

      if (response.status === 200 || response.status === 201) {
        // Verifica el contenido de la respuesta
        if (response.data && response.data.id) {
          Swal.fire({
            icon: "success",
            title: "Creado con Éxito",
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            window.location.href = "/Views/home";
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error al Crear",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al Crear",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error al realizar la solicitud POST:", error);

      // Aquí puedes agregar un manejo de errores más específico si es necesario

      Swal.fire({
        icon: "error",
        title: "Error al Crear",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const dispatch: AppDispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  const handleDeleteImage = (imagen: string)=>{

    const filteredImages = values.images.filter(image => image !== imagen);
      setValues((imagen) => ({
        ...values,
        images: filteredImages,
      }));

  }

  useEffect(() => {
    const loged = localStorage.getItem("keys");
    let keys;

    loged ? (keys = JSON.parse(loged)) : null;

    if (!isAuthenticated) {

      if (keys) {
        dispatch(authenticateUserWithTokenAsync());
      } else {
        alert("Debes iniciar sesion para poder publicar");
        router.push("/Views/Login");
      }
    } else setShow(true);

  }, [isAuthenticated]);

  if (show) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen p-5 md:p-10 mt-0 z-10">
          <div className="md:flex md:items-center z-10">
            <form
              
              onSubmit={(e) => handleSubmit(e, values)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-100 p-5 md:p-5 rounded-lg shadow-md max-w-3x1 z-10">
                <div className="mb-5">
                  <label className="block text-gray-800 font-bold mb-2">
                    Título:{" "}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onFocus={() => setFocused("title")}
                    onBlur={() => setFocused(null)}
                    className="border-2 border-gray-300 p-2 w-3/4 rounded-lg"
                  />
                  <div className="mb-2">
                    {errors.title && focused === "title" && (
                      <span className="text-red-500 text-sm">{errors.title}</span>
                    )}
                  </div>
                </div>


                <div className="mb-5">
                  <label className="block text-gray-700 font-bold mb-2">
                    Condicion:{" "}
                  </label>
                  <div className="relative">
                    <select
                      name="condition"
                      value={values.condition}
                      onChange={handleSelectChange}
                      className="border-2 border-gray-300 p-2 w-1/3 rounded-lg"
                      onFocus={() => setFocused("type")}
                      onBlur={() => setFocused(null)}
                    >
                      <option value="empty"></option>
                      <option value="rent">Alquiler</option>
                      <option value="sell">Venta</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    {errors.type && focused === "type" && (
                      <span className="text-red-500 text-sm">{errors.type}</span>
                    )}
                  </div>
                </div>                

                <div className="mb-5">
                  <label className="block text-gray-800 font-bold mb-2">
                    País: {" "}
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={values.country}
                    onChange={handleChange}
                    onFocus={() => setFocused("country")}
                    onBlur={() => setFocused(null)}
                    className="border-2 border-gray-300 p-2 w-3/4 rounded-lg"

                  />
                  <div className="mb-2">
                    {errors.country && focused === "country" && (
                      <span className="text-red-500 text-sm">
                        {errors.country}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-gray-800 font-bold mb-2">Ciudad: </label>
                  <input
                    type="text"
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                    onFocus={() => setFocused("city")}
                    onBlur={() => setFocused(null)}
                    className="border-2 border-gray-300 p-2 w-3/4 rounded-lg"
                  />
                  <div className="mb-2">
                    {errors.city && focused === "city" && (
                      <span className="text-red-500 text-sm">{errors.city}</span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-gray-800 font-bold mb-2" >Nombre de la Calle: </label>
                  <input
                    type="text"
                    name="streetName"
                    value={values.streetName}
                    onChange={handleChange}
                    onFocus={() => setFocused("streetName")}
                    onBlur={() => setFocused(null)}
                    className="border-2 border-gray-300 p-2 w-3/4 rounded-lg"
                  />
                  <div className="mb-2">
                    {errors.streetName && focused === "streetName" && (
                      <span className="text-red-500 text-sm">
                        {errors.streetName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-gray-800 font-bold mb-2">Número de calle: </label>
                  <input
                    type="number"
                    name="streetNumber"
                    value={values.streetNumber}
                    onChange={handleChange}
                    onFocus={() => setFocused("streetNumber")}
                    onBlur={() => setFocused(null)}
                    className="border-2 border-gray-300 p-2 w-3/4 rounded-lg"
                  />
                  <div className="mb-2">
                    {errors.streetNumber && focused === "streetNumber" && (
                      <span className="text-red-500 text-sm">
                        {errors.streetNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-gray-800 font-bold mb-2">Piso: </label>
                  <input
                    type="number"
                    name="floorNumber"
                    value={values.floorNumber || ""}
                    onChange={handleChange}
                    className="border-2 border-gray-300 p-2 w-3/4 rounded-lg"
                  />
                  <div className="mb-2">
                    {errors.floorNumber && (
                      <span className="text-red-500 text-sm">
                        {errors.floorNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-gray-800 font-bold mb-2">Apartamento: </label>
                  <input
                    type="text"
                    name="aptNumber"
                    value={values.aptNumber || ""}
                    onChange={handleChange}
                    className="border-2 border-gray-300 p-2 w-3/4 rounded-lg"
                  />
                  <div className="mb-2">
                    {errors.aptNumber && (
                      <span className="text-red-500 text-sm">
                        {errors.aptNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-gray-800 font-bold mb-2">Precio: </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    max="999999999999999"
                    value={values.price || ""}
                    onChange={handleChange}
                    onFocus={() => setFocused("price")}
                    onBlur={() => setFocused(null)}
                    className="border-2 border-gray-300 p-2 w-3/4 rounded-lg"
                  />
                  <div className="mb-2">
                    {errors.price && focused === "price" && (
                      <span className="text-red-500 text-sm">{errors.price}</span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-gray-800 font-bold mb-2">
                    Descripción:{" "}
                  </label>
                  <textarea
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onFocus={() => setFocused("description")}
                    onBlur={() => setFocused(null)}
                    className="border p-2 w-3/4 rounded-lg"
                  />
                  <div className="mb-2">
                    {errors.description && focused === "description" && (
                      <span className="text-red-500 text-sm">
                        {errors.description}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-gray-700 font-bold mb-2">
                    Imagen:{" "}
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border p-5 w-full rounded-lg ${
                      isDragActive ? "bg-gray-100" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      {...getInputProps()}
                      onFocus={() => setFocused("images")}
                      onBlur={() => setFocused(null)}
                      className="border p-2 w-1/4 rounded-lg"
                    />
                    <div className="text-center">
                      <FontAwesomeIcon
                        icon={faCloudUploadAlt}
                        size="2x"
                        color="#718096"
                      />
                      <p className="mt-2">
                        {isDragActive
                          ? "Suelta las imágenes aquí"
                          : "Arrastra y suelta imágenes o haz clic para seleccionarlas"}
                      </p>
                    </div>
                  </div>
                  <div className="mb-2">
                    {acceptedFiles.length > 0 && (
                      <span className="text-green-500 text-sm">
                        {acceptedFiles.length} imagen
                        {acceptedFiles.length > 1 ? "es" : ""} seleccionada
                        {acceptedFiles.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="mb-2">
                    {acceptedFiles.length === 0 &&
                      errors.image &&
                      focused === "images" && (
                        <span className="text-red-500 text-sm">
                          {errors.images}
                        </span>
                      )}
                  </div>

                  
                  <div className="flex flex-col sm:flex-row gap-10 m-2.5">
                    {values.images?.map((imagen, index) => (
                      <>
                      <div className="sm:text-center">
                        <button onClick={()=> handleDeleteImage(imagen)} className="cursor-pointer text-sm font-medium px-2 py-1 items-center rounded-full hover:bg-red-600 hover:text-white">X</button>
                        {/* <button onClick={()=> handleDeleteImage(imagen)}
                          className="items-center p-2 bg-red-600 transition ease-in-out delay-75 hover:bg-red-700 text-white text-sm font-medium rounded-md hover:scale-110"
                        >
                          X
                        </button> */}
                        <img key={index} src={imagen} alt={`image`} className="rounded h-52 w-52 object-cover object-center"/>
                      </div>
                      </>
                      ))}
                    
                  </div> 

                  <div className="mb-5 z-10">
                    <button
                      type="submit"
                      className="button_lg bg-[#fc9a84] text-white py-3 px-6 md:px-16 rounded-lg hover:bg-[#fc9a74] transition-all duration-300 mt-0 md:mt-0 ml-2 mb-0 z-10 relative overflow-hidden focus:outline-none text-lg md:text-xl"
                      //disabled={disable(errors)}
                    >
                      <span className="button_text">Crear</span>
                      <span className="button_sl"></span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

    );
  }

}


