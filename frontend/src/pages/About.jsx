const About = () => {
  const historia = [
    {
      anio: '2019',
      titulo: 'El Comienzo',
      descripcion: 'RoomStay nace como una idea simple: conectar personas con espacios acogedores en toda Colombia.',
    },
    {
      anio: '2021',
      titulo: 'Crecimiento',
      descripcion: 'Llegamos a 10 ciudades principales con más de 500 habitaciones verificadas y miles de huéspedes felices.',
    },
    {
      anio: '2023',
      titulo: 'Innovación',
      descripcion: 'Implementamos check-in digital, atención 24/7 y garantía de satisfacción del 100% en todas las reservas.',
    },
    {
      anio: '2026',
      titulo: 'Hoy',
      descripcion: 'Somos la plataforma líder en alquiler de habitaciones con presencia en 20+ ciudades y partnerships internacionales.',
    },
  ];

  const valores = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      titulo: 'Pasión por el servicio',
      descripcion: 'Nos apasiona crear experiencias memorables para cada huésped que elige RoomStay.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      titulo: 'Confianza y seguridad',
      descripcion: 'Todas las habitaciones son verificadas personalmente. Tu tranquilidad es nuestra prioridad.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      titulo: 'Innovación constante',
      descripcion: 'Siempre buscamos nuevas formas de mejorar tu experiencia con tecnología y procesos ágiles.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      titulo: 'Compromiso sostenible',
      descripcion: 'Trabajamos con anfitriones comprometidos con prácticas eco-amigables y comunidades locales.',
    },
  ];

  const equipo = [
    { nombre: 'María Rodríguez', cargo: 'CEO & Fundadora', iniciales: 'MR' },
    { nombre: 'Carlos Mendoza', cargo: 'CTO', iniciales: 'CM' },
    { nombre: 'Ana Gómez', cargo: 'Directora de Operaciones', iniciales: 'AG' },
    { nombre: 'Luis Torres', cargo: 'Jefe de Experiencia', iniciales: 'LT' },
  ];

  const stats = [
    { numero: '50K+', etiqueta: 'Huéspedes felices' },
    { numero: '1.2K+', etiqueta: 'Habitaciones' },
    { numero: '20+', etiqueta: 'Ciudades' },
    { numero: '4.9★', etiqueta: 'Calificación promedio' },
  ];

  return (
    <div className="flex-1">
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary-200 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-secondary-200 blur-3xl" />
        </div>
        <div className="container-app relative z-10 text-center">
          <span className="badge bg-primary-100 text-primary-700 mb-4 px-3 py-1">
            ¿Quiénes Somos?
          </span>
          <h1 className="mb-6 max-w-3xl mx-auto">
            Más que habitaciones,{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              creamos hogares
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Somos la plataforma colombiana que conecta viajeros, estudiantes y profesionales
            con habitaciones cómodas, seguras y llenas de calidez en todo el país.
          </p>
        </div>
      </section>

      <section className="container-app py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="card p-6 text-center hover:shadow-card-hover transition-shadow">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                {stat.numero}
              </p>
              <p className="text-sm md:text-base text-neutral-600 font-medium">{stat.etiqueta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-y border-neutral-200">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="badge bg-secondary-100 text-secondary-700 mb-3 px-3 py-1">
                Nuestra Historia
              </span>
              <h2 className="mb-5">De una idea a miles de hogares</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Todo comenzó en un pequeño apartamento de Bogotá con una visión clara: hacer que
                encontrar un lugar donde quedarse fuera de casa fuera tan fácil como reservar una comida.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Hoy, RoomStay es la plataforma confiable que utilizan miles de colombianos y extranjeros
                para encontrar su habitación perfecta, con procesos transparentes, soporte humano y
                una comunidad de anfitriones excepcionales.
              </p>
            </div>
            <div className="relative">
              <div className="space-y-4">
                {historia.map((item, idx) => (
                  <div key={idx} className="flex gap-4 card p-5 hover:shadow-card-hover transition-shadow">
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {item.anio}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">{item.titulo}</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">{item.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-app py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          <span className="badge bg-amber-100 text-amber-700 mb-3 px-3 py-1">
            Nuestros Valores
          </span>
          <h2 className="mb-3">Lo que nos mueve cada día</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Estos principios guían cada decisión que tomamos y cada experiencia que creamos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {valores.map((valor, idx) => (
            <div key={idx} className="card p-6 md:p-8 hover:shadow-card-hover transition-all hover:-translate-y-0.5">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-700 flex items-center justify-center">
                  {valor.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{valor.titulo}</h3>
                  <p className="text-neutral-600 leading-relaxed">{valor.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-y border-neutral-200">
        <div className="container-app">
          <div className="text-center mb-10 md:mb-12">
            <span className="badge bg-primary-100 text-primary-700 mb-3 px-3 py-1">
              El Equipo
            </span>
            <h2 className="mb-3">Personas comprometidas contigo</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Un equipo multidisciplinario que trabaja con pasión para que tu experiencia sea inolvidable.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {equipo.map((persona, idx) => (
              <div key={idx} className="card p-6 text-center group hover:shadow-card-hover transition-all">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform">
                  {persona.iniciales}
                </div>
                <h3 className="font-semibold text-neutral-900 mb-0.5">{persona.nombre}</h3>
                <p className="text-sm text-neutral-500">{persona.cargo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-12 md:py-16">
        <div className="card bg-gradient-to-r from-primary-600 to-secondary-600 p-8 md:p-12 text-center text-white">
          <h2 className="text-white mb-4">¿Te gustaría ser parte de RoomStay?</h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg">
            Ya sea como anfitrión, colaborador o huésped, siempre hay espacio para ti en nuestra familia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary bg-white text-neutral-900 hover:bg-neutral-100 border-0">
              Quiero ser anfitrión
            </button>
            <button className="btn-secondary border-white text-white hover:bg-white/10 bg-transparent">
              Contáctanos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
