'use client';

import ContactForm from '../components/ContactForm';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Contactez-nous</h1>
            <p className="text-lg text-gray-600">Service disponible 24h/24 — 7j/7</p>
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
                      <a href="tel:0667237822" className="text-blue-600 font-medium">06 67 23 78 22</a>
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
                      <p className="text-sm text-gray-500 mt-0.5">Réponse sous 2h</p>
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
                <a href="tel:0667237822" className="inline-block bg-white text-blue-600 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                  06 67 23 78 22
                </a>
              </div>
            </div>

            {/* Formulaire */}
            <ContactForm />

          </div>
        </div>
      </div>
    </div>
  );
}
