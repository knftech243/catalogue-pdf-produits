// Pages légales : BROUILLONS à faire relire avant publication officielle.

import type { ReactNode } from 'react';
import { Icon } from '../components/Icon';
import { LEGAL_DRAFT_NOTICE, PRIVACY_NOTICE } from '../config/site';
import { Link } from '../router/router';

const UPDATED = '30 septembre 2026';

/** Élément à compléter par l'éditeur du site. */
function P({ children }: { children: ReactNode }) {
  return <span className="placeholder-text">[{children}]</span>;
}

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <section className="page-hero">
        <div className="container narrow">
          <p className="eyebrow">Informations légales</p>
          <h1>{title}</h1>
          <p className="small-note">Dernière mise à jour : {UPDATED}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container prose">
          <div className="notice notice-warning legal-draft" role="note">
            <Icon name="alert" />
            <p>
              <strong>{LEGAL_DRAFT_NOTICE}</strong>
            </p>
          </div>
          {children}
        </div>
      </section>
    </>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p>
        Cette politique explique quelles données sont utilisées lorsque vous utilisez Catalogue
        Express, et comment elles sont protégées. Le principe est simple :{' '}
        <strong>{PRIVACY_NOTICE}</strong>
      </p>

      <h2>1. Responsable du site</h2>
      <p>
        Le site est édité par <P>nom de l’éditeur ou de la société</P>, <P>adresse</P>, joignable à
        l’adresse <P>e-mail de contact</P>. Voir aussi les{' '}
        <Link to="/mentions-legales">mentions légales</Link>.
      </p>

      <h2>2. Un outil qui fonctionne sur votre appareil</h2>
      <p>
        Catalogue Express fonctionne dans votre navigateur. Les informations de votre boutique, vos
        produits et vos photos sont traités <strong>localement</strong> : les photos sont
        redimensionnées et le PDF est fabriqué sur votre téléphone ou votre ordinateur. Ces contenus
        ne sont <strong>pas envoyés</strong> à nos serveurs et nous n’y avons pas accès.
      </p>
      <p>Il n’y a ni compte utilisateur, ni mot de passe, ni base de données de clients.</p>

      <h2>3. Données enregistrées sur votre appareil</h2>
      <p>
        Pour que vous retrouviez votre travail, l’outil peut enregistrer votre catalogue{' '}
        <strong>dans votre navigateur</strong>, sur votre appareil uniquement :
      </p>
      <ul>
        <li>
          <strong>localStorage</strong> : informations de la boutique, liste des produits (textes et
          prix), réglages du modèle et votre choix d’activer ou non la sauvegarde ;
        </li>
        <li>
          <strong>IndexedDB</strong> : les photos et le logo, déjà réduits pour le catalogue.
        </li>
      </ul>
      <p>
        Cette sauvegarde automatique est activée par défaut et signalée dans l’outil. Vous pouvez à
        tout moment la <strong>désactiver</strong> ou <strong>effacer vos données locales</strong>{' '}
        depuis le bouton « Données sur cet appareil » de l’outil de création. Vous pouvez aussi
        effacer les données du site dans les réglages de votre navigateur. Ces données restent
        enregistrées jusqu’à leur effacement par vous ou par votre navigateur.
      </p>
      <p>Aucune de ces données n’est lue par nous : elles ne quittent pas votre appareil.</p>

      <h2>4. Cookies et mesure d’audience</h2>
      <p>
        Dans sa version actuelle, le site n’utilise <strong>aucun cookie publicitaire</strong> et{' '}
        <strong>aucun outil de mesure d’audience</strong>. Si un outil de mesure est ajouté plus
        tard, cette politique sera mise à jour et votre consentement sera demandé lorsque la loi
        l’exige.
      </p>

      <h2>5. Données techniques d’hébergement</h2>
      <p>
        Comme tout site web, l’hébergeur <P>nom de l’hébergeur</P> peut enregistrer des journaux
        techniques (adresse IP, date et heure, page demandée, type de navigateur) pour assurer la
        sécurité et le bon fonctionnement du service. Ces journaux sont conservés{' '}
        <P>durée de conservation</P> puis supprimés.
      </p>

      <h2>6. Contact par e-mail</h2>
      <p>
        Le formulaire de contact n’envoie rien lui-même : il ouvre votre application e-mail. Si vous
        nous écrivez, nous utilisons votre adresse et votre message uniquement pour vous répondre,
        et les conservons <P>durée, par exemple 12 mois</P>.
      </p>

      <h2>7. Paiements (future offre Premium)</h2>
      <p>
        Aucun paiement n’est possible aujourd’hui. Lorsque l’offre Premium ouvrira, le paiement sera
        traité par un prestataire spécialisé (<P>nom du prestataire</P>). Catalogue Express ne
        collectera jamais vos numéros de carte bancaire ou vos codes Mobile Money. Cette politique
        sera mise à jour avant l’ouverture des paiements.
      </p>

      <h2>8. Vos droits</h2>
      <p>
        Selon la loi applicable dans votre pays (par exemple le Règlement général sur la protection
        des données dans l’Union européenne, ou les lois nationales de protection des données
        personnelles en vigueur en Afrique francophone), vous disposez notamment de droits d’accès,
        de rectification et d’effacement. Comme vos contenus restent sur votre appareil, vous
        exercez ces droits directement en les modifiant ou en les effaçant. Pour toute question :{' '}
        <P>e-mail de contact</P>.
      </p>

      <h2>9. Sécurité</h2>
      <p>
        Le site est servi en HTTPS. Aucune clé secrète, aucun mot de passe et aucune donnée bancaire
        n’est stockée dans le code du site. Nous vous recommandons de ne pas utiliser l’outil sur un
        appareil partagé avec des inconnus, ou d’effacer vos données locales après usage.
      </p>

      <h2>10. Modifications</h2>
      <p>
        Cette politique peut évoluer. La date de dernière mise à jour figure en haut de la page.
      </p>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Conditions d’utilisation">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions encadrent l’utilisation du site Catalogue Express, édité par{' '}
        <P>nom de l’éditeur</P> (ci-après « nous »), qui permet de créer un catalogue PDF à partir
        de photos et d’informations sur des produits. En utilisant le site, vous acceptez ces
        conditions.
      </p>

      <h2>2. Accès au service</h2>
      <p>
        Le service est accessible gratuitement, sans inscription, depuis un navigateur récent.
        L’offre gratuite permet de créer un catalogue, de le prévisualiser et de télécharger un PDF
        de démonstration comportant une mention « version démo ». Une offre payante (Premium) pourra
        être proposée ultérieurement ; elle fera l’objet de conditions complémentaires affichées
        avant tout paiement.
      </p>

      <h2>3. Vos contenus</h2>
      <ul>
        <li>Vous restez propriétaire des photos, textes, logos et prix que vous ajoutez.</li>
        <li>
          Vous garantissez disposer des droits nécessaires sur ces contenus (photos prises par vous
          ou utilisées avec autorisation, marques et logos vous appartenant ou dont l’usage est
          autorisé).
        </li>
        <li>
          Vous êtes seul responsable de l’exactitude des informations (prix, descriptions,
          disponibilités) et du respect des lois applicables à votre activité et aux produits
          vendus.
        </li>
        <li>
          Il est interdit d’utiliser le service pour présenter des produits illicites, contrefaits
          ou dangereux, ou des contenus trompeurs, haineux ou portant atteinte aux droits d’autrui.
        </li>
      </ul>
      <p>
        Vos contenus étant traités sur votre appareil, nous n’en avons pas connaissance et ne les
        conservons pas (voir la <Link to="/confidentialite">politique de confidentialité</Link>).
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        Le site, son code, ses modèles de catalogue, ses textes, son logo et ses illustrations sont
        protégés. Vous pouvez utiliser librement les catalogues que vous générez pour votre
        activité, y compris à des fins commerciales. La reproduction du service lui-même ou de ses
        modèles en dehors de cet usage n’est pas autorisée sans accord écrit.
      </p>

      <h2>5. Disponibilité et responsabilité</h2>
      <p>
        Nous faisons notre possible pour que le service fonctionne correctement, sans pouvoir
        garantir une disponibilité permanente ni l’absence d’erreur. Le résultat peut varier selon
        l’appareil et le navigateur utilisés : vérifiez toujours l’aperçu et le PDF avant de le
        diffuser. Pensez à conserver une copie de vos PDF : les données locales peuvent être
        effacées par votre navigateur. Dans les limites permises par la loi, notre responsabilité ne
        saurait être engagée pour une perte de données locales ou pour les conséquences
        d’informations inexactes saisies par l’utilisateur.
      </p>

      <h2>6. Liens et services tiers</h2>
      <p>
        Les catalogues peuvent contenir des liens vers WhatsApp, Instagram ou Facebook que vous avez
        choisi d’ajouter. Ces services appartiennent à leurs propriétaires respectifs et ont leurs
        propres conditions. Catalogue Express n’est affilié à aucun de ces services.
      </p>

      <h2>7. Modification des conditions</h2>
      <p>
        Ces conditions peuvent être modifiées. La version en ligne à la date d’utilisation
        s’applique.
      </p>

      <h2>8. Droit applicable</h2>
      <p>
        Les présentes conditions sont soumises au droit <P>pays / juridiction</P>. En cas de litige,
        une solution amiable sera recherchée avant toute action. Contact : <P>e-mail de contact</P>.
      </p>
    </LegalLayout>
  );
}

export function RefundPage() {
  return (
    <LegalLayout title="Politique de remboursement">
      <div className="notice">
        <Icon name="info" />
        <p>
          <strong>Aujourd’hui, aucun paiement n’est possible sur Catalogue Express.</strong> Cette
          politique s’appliquera uniquement à la future offre Premium, lorsque le paiement sera
          ouvert.
        </p>
      </div>

      <h2>1. Produit concerné</h2>
      <p>
        L’offre Premium donnera accès à un contenu numérique : l’export de catalogues PDF sans
        filigrane et des fonctionnalités supplémentaires, selon la formule choisie (
        <P>export unique, pack d’exports ou accès à durée déterminée</P>).
      </p>

      <h2>2. Essai avant achat</h2>
      <p>
        L’aperçu et l’export de démonstration gratuits permettent de vérifier le rendu exact de
        votre catalogue avant tout achat. Nous vous invitons à les utiliser avant de payer.
      </p>

      <h2>3. Cas de remboursement</h2>
      <p>
        Vous pourrez demander un remboursement dans un délai de <P>14 jours</P> après l’achat si :
      </p>
      <ul>
        <li>vous n’avez utilisé aucun export Premium ;</li>
        <li>
          un problème technique empêche la génération du PDF et n’a pas pu être résolu avec notre
          aide ;
        </li>
        <li>vous avez été débité plusieurs fois par erreur pour le même achat.</li>
      </ul>

      <h2>4. Droit de rétractation</h2>
      <p>
        Pour les contenus numériques fournis immédiatement, certaines législations (notamment dans
        l’Union européenne) prévoient que le droit de rétractation ne s’applique plus une fois
        l’exécution commencée avec votre accord exprès. Cette règle sera indiquée clairement avant
        le paiement. <P>À adapter selon le pays et le prestataire de paiement.</P>
      </p>

      <h2>5. Procédure</h2>
      <ol>
        <li>
          Écrivez à <P>e-mail de contact</P> avec la référence de votre paiement (reçu du
          prestataire) et la raison de votre demande.
        </li>
        <li>
          Nous répondons sous <P>5 jours ouvrés</P>.
        </li>
        <li>
          En cas d’accord, le remboursement est effectué par le même moyen de paiement, via le
          prestataire <P>nom du prestataire</P>, sous <P>délai habituel du prestataire</P>.
        </li>
      </ol>
      <p>
        Nous ne vous demanderons jamais votre mot de passe, votre code secret ou votre numéro de
        carte complet.
      </p>
    </LegalLayout>
  );
}

export function LegalNoticePage() {
  return (
    <LegalLayout title="Mentions légales">
      <h2>Éditeur du site</h2>
      <ul>
        <li>
          Nom ou raison sociale : <P>à compléter</P>
        </li>
        <li>
          Forme juridique et capital : <P>à compléter</P>
        </li>
        <li>
          Adresse : <P>à compléter</P>
        </li>
        <li>
          Numéro d’immatriculation (RCCM, SIRET…) : <P>à compléter</P>
        </li>
        <li>
          Directeur ou directrice de la publication : <P>à compléter</P>
        </li>
        <li>
          Contact : <P>e-mail de contact</P>
        </li>
      </ul>

      <h2>Hébergement</h2>
      <ul>
        <li>
          Hébergeur : <P>nom de l’hébergeur</P>
        </li>
        <li>
          Adresse : <P>adresse de l’hébergeur</P>
        </li>
        <li>
          Contact : <P>site ou téléphone de l’hébergeur</P>
        </li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le nom Catalogue Express (nom provisoire), le logo, les modèles de catalogue, les textes et
        les illustrations du site sont la propriété de l’éditeur, sauf mention contraire. Les
        illustrations des boutiques de démonstration et les pictogrammes ont été créés spécialement
        pour ce projet. Les boutiques de démonstration sont fictives.
      </p>

      <h2>Marques citées</h2>
      <p>
        WhatsApp, Facebook, Instagram et TikTok sont des marques de leurs propriétaires respectifs.
        Catalogue Express n’est ni affilié, ni approuvé par ces sociétés.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Voir la <Link to="/confidentialite">politique de confidentialité</Link>.
      </p>
    </LegalLayout>
  );
}
