import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LegalLayout } from '@/components/layout/LegalLayout'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-title font-bold text-on-surface">
        {title}
      </h2>
      <div className="space-y-3 text-body-md leading-relaxed text-on-surface-variant">
        {children}
      </div>
    </section>
  )
}

export default function PrivacidadPage() {
  return (
    <LegalLayout
      breadcrumb="Política de Privacidad"
      title="Política de Privacidad"
      updatedAt="14 de septiembre de 2026"
      icon="shield_person"
    >
      <Section title="1. Responsable del tratamiento">
        <p>
          CourseHub ESPOL es una plataforma académica comunitaria operada por
          estudiantes. Actuamos con transparencia respecto a la información que
          manejamos y a la finalidad de su uso.
        </p>
      </Section>

      <Section title="2. Información que recopilamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Datos de cuenta:</strong> correo institucional, seudónimo y
            contraseña cifrada, necesarios para el registro.
          </li>
          <li>
            <strong>Contenido aportado:</strong> documentos y enlaces que subes a
            la Plataforma.
          </li>
          <li>
            <strong>Datos de uso:</strong> recursos vistos, descargados,
            guardados y valoraciones realizadas.
          </li>
        </ul>
      </Section>

      <Section title="3. Uso de la información">
        <p>Utilizamos tu información para:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Crear y administrar tu cuenta.</li>
          <li>Publicar y gestionar los recursos que aportas.</li>
          <li>Mostrar tu seudónimo junto a tus contribuciones y valoraciones.</li>
          <li>Mejorar la experiencia y el funcionamiento de la Plataforma.</li>
        </ul>
      </Section>

      <Section title="4. Base legal y finalidad">
        <p>
          Tratamos tus datos sobre la base del consentimiento otorgado al
          registrarte y en el marco de una finalidad académica y comunitaria
          legítima. No utilizamos tus datos para fines publicitarios.
        </p>
      </Section>

      <Section title="5. Almacenamiento y seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tu
          información, incluyendo cifrado en tránsito y almacenamiento en
          servicios seguros. Ningún sistema es infalible, pero trabajamos para
          minimizar los riesgos.
        </p>
      </Section>

      <Section title="6. Compartición con terceros">
        <p>
          No vendemos ni alquilamos tus datos personales. Podemos compartir
          información únicamente con proveedores de infraestructura (por
          ejemplo, alojamiento y almacenamiento de archivos) que procesan los
          datos según nuestras instrucciones y bajo obligaciones de
          confidencialidad.
        </p>
      </Section>

      <Section title="7. Conservación">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa o mientras sea
          necesario para cumplir con los fines descritos. Al eliminar tu cuenta,
          tus datos personales asociados se eliminan, salvo obligaciones legales
          que exijan su conservación.
        </p>
      </Section>

      <Section title="8. Derechos del titular">
        <p>
          Tienes derecho a acceder, rectificar, suprimir y solicitar la
          portabilidad de tus datos, así como a oponerte a su tratamiento.
          Puedes ejercer estos derechos contactándonos a través de la sección{' '}
          <Link to="/contacto" className="text-secondary hover:underline">
            Contacto
          </Link>{' '}
          de la Plataforma.
        </p>
      </Section>

      <Section title="9. Cookies y tecnologías similares">
        <p>
          La Plataforma utiliza almacenamiento local y tokens de sesión
          estrictamente necesarios para el funcionamiento seguro de la
          autenticación. No utilizamos cookies de seguimiento de terceros.
        </p>
      </Section>

      <Section title="10. Cambios a esta política">
        <p>
          Actualizaremos esta Política cuando sea necesario. Las modificaciones
          entrarán en vigor al momento de su publicación en esta página.
        </p>
      </Section>

      <Section title="11. Contacto">
        <p>
          Para consultas relacionadas con la privacidad, contáctanos a través de
          la sección{' '}
          <Link to="/contacto" className="text-secondary hover:underline">
            Contacto
          </Link>{' '}
          de la Plataforma.
        </p>
      </Section>
    </LegalLayout>
  )
}