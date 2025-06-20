--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-06-19 22:46:20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 33189)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 232 (class 1255 OID 33175)
-- Name: clean_expired_tokens(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clean_expired_tokens() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM token_blacklist WHERE expires_at < NOW();
END;
$$;


ALTER FUNCTION public.clean_expired_tokens() OWNER TO postgres;

--
-- TOC entry 233 (class 1255 OID 33176)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 227 (class 1259 OID 33129)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    user_id integer,
    doctor_id integer,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    status character varying(20) DEFAULT 'scheduled'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 33128)
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 226
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- TOC entry 223 (class 1259 OID 33095)
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    user_id integer,
    specialty_id integer,
    license_number character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 33083)
-- Name: specialties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specialties (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.specialties OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 33068)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(20),
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'doctor'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 33184)
-- Name: appointments_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.appointments_view AS
 SELECT a.id AS appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.notes,
    a.created_at,
    patient.id AS patient_id,
    patient.name AS patient_name,
    patient.email AS patient_email,
    patient.phone AS patient_phone,
    doctor.id AS doctor_id,
    doctor.name AS doctor_name,
    d.license_number,
    s.name AS specialty_name
   FROM ((((public.appointments a
     JOIN public.users patient ON ((a.user_id = patient.id)))
     JOIN public.doctors d ON ((a.doctor_id = d.id)))
     JOIN public.users doctor ON ((d.user_id = doctor.id)))
     JOIN public.specialties s ON ((d.specialty_id = s.id)));


ALTER VIEW public.appointments_view OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 33115)
-- Name: doctor_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_availability (
    id integer NOT NULL,
    doctor_id integer,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctor_availability_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7)))
);


ALTER TABLE public.doctor_availability OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 33114)
-- Name: doctor_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_availability_id_seq OWNER TO postgres;

--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 224
-- Name: doctor_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_availability_id_seq OWNED BY public.doctor_availability.id;


--
-- TOC entry 222 (class 1259 OID 33094)
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 222
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- TOC entry 230 (class 1259 OID 33179)
-- Name: doctors_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.doctors_view AS
 SELECT d.id AS doctor_id,
    d.license_number,
    u.id AS user_id,
    u.name AS doctor_name,
    u.email AS doctor_email,
    u.phone AS doctor_phone,
    s.id AS specialty_id,
    s.name AS specialty_name,
    s.description AS specialty_description,
    d.created_at
   FROM ((public.doctors d
     JOIN public.users u ON ((d.user_id = u.id)))
     JOIN public.specialties s ON ((d.specialty_id = s.id)))
  WHERE ((u.role)::text = 'doctor'::text);


ALTER VIEW public.doctors_view OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 33082)
-- Name: specialties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.specialties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.specialties_id_seq OWNER TO postgres;

--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 220
-- Name: specialties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.specialties_id_seq OWNED BY public.specialties.id;


--
-- TOC entry 229 (class 1259 OID 33154)
-- Name: token_blacklist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.token_blacklist (
    id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.token_blacklist OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 33153)
-- Name: token_blacklist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.token_blacklist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.token_blacklist_id_seq OWNER TO postgres;

--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 228
-- Name: token_blacklist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.token_blacklist_id_seq OWNED BY public.token_blacklist.id;


--
-- TOC entry 218 (class 1259 OID 33067)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 218
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4723 (class 2604 OID 33132)
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- TOC entry 4721 (class 2604 OID 33118)
-- Name: doctor_availability id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_availability ALTER COLUMN id SET DEFAULT nextval('public.doctor_availability_id_seq'::regclass);


--
-- TOC entry 4719 (class 2604 OID 33098)
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- TOC entry 4717 (class 2604 OID 33086)
-- Name: specialties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialties ALTER COLUMN id SET DEFAULT nextval('public.specialties_id_seq'::regclass);


--
-- TOC entry 4727 (class 2604 OID 33157)
-- Name: token_blacklist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_blacklist ALTER COLUMN id SET DEFAULT nextval('public.token_blacklist_id_seq'::regclass);


--
-- TOC entry 4713 (class 2604 OID 33071)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4927 (class 0 OID 33129)
-- Dependencies: 227
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.appointments VALUES (1, 6, 1, '2025-06-22', '10:00:00', 'scheduled', 'Consulta de control cardiovascular', '2025-06-19 11:44:08.652553', '2025-06-19 11:44:08.652553');
INSERT INTO public.appointments VALUES (2, 7, 2, '2025-06-24', '11:00:00', 'scheduled', 'Revisión dermatológica general', '2025-06-19 11:44:08.652553', '2025-06-19 11:44:08.652553');
INSERT INTO public.appointments VALUES (3, 8, 4, '2025-06-21', '14:00:00', 'scheduled', 'Chequeo médico general', '2025-06-19 11:44:08.652553', '2025-06-19 11:44:08.652553');
INSERT INTO public.appointments VALUES (4, 9, 1, '2025-07-08', '08:00:00', 'scheduled', '1', '2025-06-19 16:16:58.735083', '2025-06-19 16:16:58.735083');


--
-- TOC entry 4925 (class 0 OID 33115)
-- Dependencies: 225
-- Data for Name: doctor_availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.doctor_availability VALUES (1, 1, 1, '08:00:00', '17:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (2, 1, 2, '08:00:00', '17:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (3, 1, 3, '08:00:00', '17:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (4, 1, 4, '08:00:00', '17:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (5, 1, 5, '08:00:00', '17:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (6, 2, 1, '09:00:00', '16:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (7, 2, 2, '09:00:00', '16:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (8, 2, 3, '09:00:00', '16:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (9, 2, 4, '09:00:00', '16:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (10, 2, 5, '09:00:00', '16:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (11, 3, 1, '07:00:00', '15:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (12, 3, 2, '07:00:00', '15:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (13, 3, 3, '07:00:00', '15:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (14, 3, 4, '07:00:00', '15:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (15, 3, 5, '07:00:00', '15:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (16, 4, 1, '08:00:00', '18:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (17, 4, 2, '08:00:00', '18:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (18, 4, 3, '08:00:00', '18:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (19, 4, 4, '08:00:00', '18:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (20, 4, 5, '08:00:00', '18:00:00', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctor_availability VALUES (21, 4, 6, '09:00:00', '14:00:00', '2025-06-19 11:44:08.652553');


--
-- TOC entry 4923 (class 0 OID 33095)
-- Dependencies: 223
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.doctors VALUES (1, 2, 2, 'MED-001-2024', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctors VALUES (2, 3, 3, 'MED-002-2024', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctors VALUES (3, 4, 4, 'MED-003-2024', '2025-06-19 11:44:08.652553');
INSERT INTO public.doctors VALUES (4, 5, 1, 'MED-004-2024', '2025-06-19 11:44:08.652553');


--
-- TOC entry 4921 (class 0 OID 33083)
-- Dependencies: 221
-- Data for Name: specialties; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.specialties VALUES (1, 'Medicina General', 'Atención médica general y consultas básicas de salud', '2025-06-19 11:44:08.652553');
INSERT INTO public.specialties VALUES (2, 'Cardiología', 'Especialidad en enfermedades del corazón y sistema cardiovascular', '2025-06-19 11:44:08.652553');
INSERT INTO public.specialties VALUES (3, 'Dermatología', 'Especialidad en enfermedades de la piel, cabello y uñas', '2025-06-19 11:44:08.652553');
INSERT INTO public.specialties VALUES (4, 'Pediatría', 'Especialidad en atención médica infantil y adolescentes', '2025-06-19 11:44:08.652553');
INSERT INTO public.specialties VALUES (5, 'Ginecología', 'Especialidad en salud femenina y reproductiva', '2025-06-19 11:44:08.652553');
INSERT INTO public.specialties VALUES (6, 'Traumatología', 'Especialidad en lesiones del sistema musculoesquelético', '2025-06-19 11:44:08.652553');
INSERT INTO public.specialties VALUES (7, 'Neurología', 'Especialidad en enfermedades del sistema nervioso', '2025-06-19 11:44:08.652553');
INSERT INTO public.specialties VALUES (8, 'Psiquiatría', 'Especialidad en trastornos mentales y del comportamiento', '2025-06-19 11:44:08.652553');
INSERT INTO public.specialties VALUES (9, 'Oftalmología', 'Especialidad en enfermedades de los ojos y sistema visual', '2025-06-19 11:44:08.652553');
INSERT INTO public.specialties VALUES (10, 'Otorrinolaringología', 'Especialidad en oído, nariz y garganta', '2025-06-19 11:44:08.652553');


--
-- TOC entry 4929 (class 0 OID 33154)
-- Dependencies: 229
-- Data for Name: token_blacklist; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4919 (class 0 OID 33068)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (3, 'dr.dermato@mediagenda.com', '$2b$10$yQZ8vKJlJUUYQ3VEeK0Tge6VLRVJGXu4YdZ1TLQ8Y5CnP0WCZkKEe', 'Dra. María González', '+57 310 987 6543', 'doctor', '2025-06-19 11:44:08.652553', '2025-06-19 11:44:08.652553');
INSERT INTO public.users VALUES (4, 'dr.pediatra@mediagenda.com', '$2b$10$yQZ8vKJlJUUYQ3VEeK0Tge6VLRVJGXu4YdZ1TLQ8Y5CnP0WCZkKEe', 'Dr. Carlos Rodríguez', '+57 320 555 7890', 'doctor', '2025-06-19 11:44:08.652553', '2025-06-19 11:44:08.652553');
INSERT INTO public.users VALUES (5, 'dr.general@mediagenda.com', '$2b$10$yQZ8vKJlJUUYQ3VEeK0Tge6VLRVJGXu4YdZ1TLQ8Y5CnP0WCZkKEe', 'Dra. Ana López', '+57 315 444 2580', 'doctor', '2025-06-19 11:44:08.652553', '2025-06-19 11:44:08.652553');
INSERT INTO public.users VALUES (6, 'paciente1@email.com', '$2b$10$yQZ8vKJlJUUYQ3VEeK0Tge6VLRVJGXu4YdZ1TLQ8Y5CnP0WCZkKEe', 'Elena Martínez', '+57 301 222 3333', 'user', '2025-06-19 11:44:08.652553', '2025-06-19 11:44:08.652553');
INSERT INTO public.users VALUES (7, 'paciente2@email.com', '$2b$10$yQZ8vKJlJUUYQ3VEeK0Tge6VLRVJGXu4YdZ1TLQ8Y5CnP0WCZkKEe', 'Roberto Silva', '+57 302 444 5555', 'user', '2025-06-19 11:44:08.652553', '2025-06-19 11:44:08.652553');
INSERT INTO public.users VALUES (8, 'paciente3@email.com', '$2b$10$yQZ8vKJlJUUYQ3VEeK0Tge6VLRVJGXu4YdZ1TLQ8Y5CnP0WCZkKEe', 'Carmen Jiménez', '+57 303 666 7777', 'user', '2025-06-19 11:44:08.652553', '2025-06-19 11:44:08.652553');
INSERT INTO public.users VALUES (9, 'ronaldsantiagoninotineo@gmail.com', '$2a$10$R7AHkLx1YZTpDMbfwoNrs.P6PLx3rlRxvHJQpzkw0VjqpODy/Dbuq', 'Ronald Santiago Niño Tineo', '+57 311 4985308', 'user', '2025-06-19 13:32:12.667542', '2025-06-19 13:32:12.667542');
INSERT INTO public.users VALUES (1, 'admin@mediagenda.com', '$2a$06$Zp/DVa8lSeTYklA5D4POPe15pdpvQDQfSHp75sAnq.SfJjZlePv/6', 'Administrador Principal', '+57 300 111 0000', 'admin', '2025-06-19 11:44:08.652553', '2025-06-19 16:21:28.245806');
INSERT INTO public.users VALUES (2, 'dr.cardio@mediagenda.com', '$2a$06$gvDWxABo48fhYU9uqNM23.LPL.rzHV7XQXARhWBitLsxBvtX1pNsW', 'Dr. Juan Pérez', '+57 300 123 4567', 'doctor', '2025-06-19 11:44:08.652553', '2025-06-19 16:23:29.883741');


--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 226
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_id_seq', 4, true);


--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 224
-- Name: doctor_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctor_availability_id_seq', 21, true);


--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 222
-- Name: doctors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctors_id_seq', 4, true);


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 220
-- Name: specialties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.specialties_id_seq', 10, true);


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 228
-- Name: token_blacklist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.token_blacklist_id_seq', 8, true);


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 218
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- TOC entry 4753 (class 2606 OID 33142)
-- Name: appointments appointments_doctor_id_appointment_date_appointment_time_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_appointment_date_appointment_time_key UNIQUE (doctor_id, appointment_date, appointment_time);


--
-- TOC entry 4755 (class 2606 OID 33140)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 4749 (class 2606 OID 33122)
-- Name: doctor_availability doctor_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT doctor_availability_pkey PRIMARY KEY (id);


--
-- TOC entry 4743 (class 2606 OID 33103)
-- Name: doctors doctors_license_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_license_number_key UNIQUE (license_number);


--
-- TOC entry 4745 (class 2606 OID 33101)
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- TOC entry 4739 (class 2606 OID 33093)
-- Name: specialties specialties_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_name_key UNIQUE (name);


--
-- TOC entry 4741 (class 2606 OID 33091)
-- Name: specialties specialties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 33162)
-- Name: token_blacklist token_blacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_blacklist
    ADD CONSTRAINT token_blacklist_pkey PRIMARY KEY (id);


--
-- TOC entry 4735 (class 2606 OID 33081)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4737 (class 2606 OID 33079)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4756 (class 1259 OID 33171)
-- Name: idx_appointments_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_date ON public.appointments USING btree (appointment_date);


--
-- TOC entry 4757 (class 1259 OID 33170)
-- Name: idx_appointments_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_doctor_id ON public.appointments USING btree (doctor_id);


--
-- TOC entry 4758 (class 1259 OID 33172)
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- TOC entry 4759 (class 1259 OID 33169)
-- Name: idx_appointments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_user_id ON public.appointments USING btree (user_id);


--
-- TOC entry 4750 (class 1259 OID 33168)
-- Name: idx_doctor_availability_day; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_availability_day ON public.doctor_availability USING btree (day_of_week);


--
-- TOC entry 4751 (class 1259 OID 33167)
-- Name: idx_doctor_availability_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_availability_doctor_id ON public.doctor_availability USING btree (doctor_id);


--
-- TOC entry 4746 (class 1259 OID 33166)
-- Name: idx_doctors_specialty_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_specialty_id ON public.doctors USING btree (specialty_id);


--
-- TOC entry 4747 (class 1259 OID 33165)
-- Name: idx_doctors_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_user_id ON public.doctors USING btree (user_id);


--
-- TOC entry 4760 (class 1259 OID 33174)
-- Name: idx_token_blacklist_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_token_blacklist_expires ON public.token_blacklist USING btree (expires_at);


--
-- TOC entry 4761 (class 1259 OID 33173)
-- Name: idx_token_blacklist_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_token_blacklist_token ON public.token_blacklist USING btree (token);


--
-- TOC entry 4732 (class 1259 OID 33163)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4733 (class 1259 OID 33164)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 4770 (class 2620 OID 33178)
-- Name: appointments update_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4769 (class 2620 OID 33177)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4767 (class 2606 OID 33148)
-- Name: appointments appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- TOC entry 4768 (class 2606 OID 33143)
-- Name: appointments appointments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4766 (class 2606 OID 33123)
-- Name: doctor_availability doctor_availability_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT doctor_availability_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- TOC entry 4764 (class 2606 OID 33109)
-- Name: doctors doctors_specialty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id) ON DELETE CASCADE;


--
-- TOC entry 4765 (class 2606 OID 33104)
-- Name: doctors doctors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-06-19 22:46:20

--
-- PostgreSQL database dump complete
--

