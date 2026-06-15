export const metadata = {
  title: 'Mentions légales | Taxi Bordeaux Solution',
  description: 'Mentions légales de Taxi Bordeaux Solution — informations légales, hébergeur et éditeur du site.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-10">Mentions légales</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Éditeur du site</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-gray-600 space-y-1">
            <p><span className="font-medium text-gray-800">Raison sociale :</span> Taxi Bordeaux Solution</p>
            <p><span className="font-medium text-gray-800">SIRET :</span> 987 573 128 00012</p>
            <p><span className="font-medium text-gray-800">Adresse :</span> Sainte-Eulalie, 33560</p>
            <p><span className="font-medium text-gray-800">Téléphone :</span> <a href="tel:+33554543466" className="text-blue-600">+33 5 54 54 34 66</a></p>
            <p><span className="font-medium text-gray-800">Email :</span> <a href="mailto:contact@taxibordeauxsolution.fr" className="text-blue-600">contact@taxibordeauxsolution.fr</a></p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Hébergement</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-gray-600 space-y-4">
            <div>
              <p className="font-medium text-gray-800">Hébergeur du site</p>
              <p>Vercel Inc.</p>
              <p>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
              <p><a href="https://vercel.com" className="text-blue-600">vercel.com</a></p>
            </div>
            <div>
              <p className="font-medium text-gray-800">Registrar du domaine</p>
              <p>Hostinger International Ltd.</p>
              <p>61 Lordou Vironos Street, Larnaca 6023, Chypre</p>
              <p><a href="https://www.hostinger.com/fr" className="text-blue-600">hostinger.fr</a></p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Propriété intellectuelle</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-gray-600">
            <p>L'ensemble du contenu de ce site (textes, images, logos) est la propriété exclusive de Taxi Bordeaux Solution. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
          </div>
        </section>

        <section className="mb-8" id="donnees-personnelles">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Données personnelles et politique de confidentialité</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-gray-600 space-y-2">
            <p>Les données collectées via le formulaire de contact (nom, téléphone, email) et le formulaire de demande de devis (email, téléphone, date souhaitée) sont utilisées uniquement pour répondre à vos demandes de transport et ne sont pas transmises à des tiers.</p>
            <p><span className="font-medium text-gray-800">Finalité :</span> traitement de vos demandes de course et envoi du devis estimatif par email.</p>
            <p><span className="font-medium text-gray-800">Base légale :</span> consentement (case à cocher lors de la demande de devis) et intérêt légitime pour le traitement des demandes de contact.</p>
            <p><span className="font-medium text-gray-800">Durée de conservation :</span> 3 ans à compter de la collecte.</p>
            <p><span className="font-medium text-gray-800">Vos droits :</span> conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition concernant vos données personnelles.</p>
            <p>Pour exercer ces droits : <a href="mailto:contact@taxibordeauxsolution.fr" className="text-blue-600">contact@taxibordeauxsolution.fr</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Cookies</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-gray-600">
            <p>Ce site utilise Google Maps pour le calcul d'itinéraires. L'utilisation de ce service est soumise à la politique de confidentialité de Google. Aucun cookie publicitaire n'est utilisé.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
