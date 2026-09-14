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

export default function TerminosPage() {
  return (
    <LegalLayout
      breadcrumb="Términos y Condiciones"
      title="Términos y Condiciones"
      updatedAt="14 de septiembre de 2026"
    >
      <Section title="1. Aceptación de los términos">
        <p>
          Al acceder o utilizar CourseHub ESPOL («la Plataforma»), aceptas y te
          obligas a cumplir estos Términos y Condiciones. Si no estás de acuerdo
          con alguna parte de estos términos, te pedimos que no utilices la
          Plataforma.
        </p>
      </Section>

      <Section title="2. Uso de la Plataforma">
        <p>
          CourseHub ESPOL es una plataforma colaborativa, sin fines de lucro y
          creada por estudiantes de la ESPOL para compartir material de estudio
          (apuntes, exámenes, talleres, guías y proyectos). La Plataforma está
          destinada exclusivamente a fines académicos e informativos.
        </p>
        <p>Te comprometes a usar la Plataforma únicamente para:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Compartir material académico que te pertenezca o que tengas derecho a compartir.</li>
          <li>Consultar y descargar recursos publicados por otros usuarios.</li>
          <li>Participar de forma respetuosa en la comunidad politécnica.</li>
        </ul>
      </Section>

      <Section title="3. Registro y cuenta">
        <p>
          Para contribuir, guardar recursos o valorar contenido es necesario
          crear una cuenta con un correo institucional de la ESPOL. Eres
          responsable de mantener la confidencialidad de tus credenciales y de
          toda actividad que ocurra en tu cuenta.
        </p>
      </Section>

      <Section title="4. Aportes de contenido">
        <p>
          Al subir material a la Plataforma declaras que posees los derechos
          necesarios sobre dicho material o que cuentas con autorización para
          compartirlo. Mantienes la titularidad de tu contenido, pero nos
          otorgas una licencia no exclusiva para almacenarlo y mostrarlo dentro
          de la Plataforma.
        </p>
        <p>
          La Plataforma se reserva el derecho de retirar cualquier material que
          infrinja la ley, los derechos de terceros o estos términos, sin previo
          aviso.
        </p>
      </Section>

      <Section title="5. Conducta prohibida">
        <p>Se prohíbe expresamente:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Publicar material con derechos de autor sin autorización.</li>
          <li>Subir contenido ofensivo, discriminatorio o ilegal.</li>
          <li>Realizar actividades de fraude, suplantación o acoso.</li>
          <li>Intentar vulnerar la seguridad de la Plataforma o de otros usuarios.</li>
        </ul>
      </Section>

      <Section title="6. Propiedad intelectual">
        <p>
          La Plataforma, su diseño, código y marca pertenecen a sus creadores y
          colaboradores. El contenido académico compartido pertenece a quienes
          lo aporten, de acuerdo con la legislación aplicable en materia de
          propiedad intelectual.
        </p>
      </Section>

      <Section title="7. Responsabilidad">
        <p>
          La Plataforma se ofrece «tal cual» y no se hace responsable por la
          exactitud, integridad o actualidad del material aportado por los
          usuarios. El uso del material académico es responsabilidad de cada
          estudiante.
        </p>
      </Section>

      <Section title="8. Suspensión de cuentas">
        <p>
          Nos reservamos el derecho de suspender o eliminar cuentas que
          infrinjan estos términos, sin perjuicio de otras acciones legales
          aplicables.
        </p>
      </Section>

      <Section title="9. Modificaciones">
        <p>
          Podemos actualizar estos Términos y Condiciones en cualquier momento.
          La versión vigente estará siempre disponible en esta página, y el uso
          continuado de la Plataforma constituye aceptación de los cambios.
        </p>
      </Section>

      <Section title="10. Contacto">
        <p>
          Ante cualquier duda sobre estos términos, puedes escribirnos a través
          de la sección{' '}
          <Link to="/contacto" className="text-secondary hover:underline">
            Contacto
          </Link>{' '}
          de la Plataforma.
        </p>
      </Section>
    </LegalLayout>
  )
}