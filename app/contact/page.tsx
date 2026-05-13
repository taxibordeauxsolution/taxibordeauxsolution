'use client';

import ContactForm from '../components/ContactForm';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Contactez votre Taxi Bordeaux</h1>
            <p className="text-lg text-gray-600 mb-2">Service disponible 24h/24 — 7j/7</p>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
              Réservez votre taxi Bordeaux par téléphone ou via notre formulaire. Pour une prise en charge immédiate à l&apos;aéroport de Mérignac, à la gare Saint-Jean ou n&apos;importe où dans la métropole bordelaise, notre équipe répond à toute heure.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">

            {/* Infos */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Nos coordonnées</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Téléphone</p>
                      <a href="tel:+33667237822" className="text-blue-600 font-medium">+33 6 67 23 78 22</a>
                      <p className="text-sm text-gray-500 mt-0.5">Service 24h/24 - 7j/7</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <a href="mailto:contact@taxibordeauxsolution.fr" className="text-blue-600">contact@taxibordeauxsolution.fr</a>
                      <p className="text-sm text-gray-500 mt-0.5">Réponse rapide</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Zone de service</p>
                      <p className="text-gray-600">Bordeaux et Gironde</p>
                      <p className="text-sm text-gray-500 mt-0.5">Aéroport, gare, centre-ville</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600 rounded-2xl p-6 text-white">
                <p className="font-bold text-lg mb-1">Réservation urgente ?</p>
                <p className="text-blue-100 text-sm mb-4">Appelez-nous directement pour une prise en charge immédiate.</p>
                <a href="tel:+33667237822" className="inline-block bg-white text-blue-600 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                  +33 6 67 23 78 22
                </a>
              </div>
            </div>

            {/* Formulaire */}
            <ContactForm />

          </div>

          {/* Bloc informatif bas de page */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-2">Taxi Bordeaux Aéroport</h2>
              <p className="text-gray-600 text-sm">Transfert direct vers l&apos;aéroport de Bordeaux-Mérignac. Suivi des vols, prise en charge Hall A, tarif réglementé.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-2">Taxi Gare Saint-Jean</h2>
              <p className="text-gray-600 text-sm">Prise en charge sur le parvis de la gare SNCF. Connexion TGV, suivi des horaires trains en temps réel.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-2">Toute la Métropole</h2>
              <p className="text-gray-600 text-sm">Mérignac, Pessac, Talence, Le Bouscat, Eysines, Bègles — votre taxi bordelais intervient dans toute la Gironde.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
