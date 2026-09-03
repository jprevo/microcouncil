import { CommandBlock } from "./CommandBlock";
import { DialogHead } from "../ui/DialogHead";

export function SkillGuide({ onClose }: { readonly onClose: () => void }) {
  return (
    <>
      <DialogHead
        id="skill-title"
        title="🧩 Le skill Micro Council"
        onClose={onClose}
      />

      <div className="modal__body">
        <p className="modal__lede">
          Le même conseil, mais directement dans votre agent : il compose le
          conseil, assemble le prompt et joue la scène, sans copier-coller.
        </p>

        <section className="modal__section">
          <h3>En deux mots</h3>
          <ul className="modal__list">
            <li>
              Vous demandez un conseil, l'agent propose trois entrées :{" "}
              <strong>créer</strong> un conseil pas à pas,{" "}
              <strong>charger</strong> un conseil déjà enregistré, ou{" "}
              <strong>automatique</strong> — il choisit les membres lui-même
              d'après votre sujet.
            </li>
            <li>
              Un petit script local pioche dans le même catalogue de compagnons
              et d'environnements que ce site, et produit exactement le même
              prompt.
            </li>
            <li>
              Chaque conseil créé est{" "}
              <strong>enregistré sur votre machine</strong> : les membres,
              l'environnement, vos instructions — mais jamais le sujet. Il
              suffit ensuite de le rappeler par son nom, « lance le conseil ABC
              sur… », pour le retrouver à l'identique.
            </li>
          </ul>
        </section>

        <section className="modal__section">
          <h3>Hermes</h3>
          <p>Dans un chat :</p>
          <CommandBlock command="Installe le skill jprevo/microcouncil/skill" />
          <p>Ou en ligne de commande :</p>
          <CommandBlock command="hermes skills install jprevo/microcouncil/skill --force" />
        </section>

        <section className="modal__section">
          <h3>Claude Code</h3>
          <p>Dans un nouveau chat :</p>
          <CommandBlock command="Installe le skill https://github.com/jprevo/microcouncil/tree/main/skill" />
          <p>Puis, pour convoquer le conseil :</p>
          <CommandBlock command="/microcouncil J'aimerais discuter de ma prochaine série" />
        </section>

        <p className="modal__note">
          Le format <code>SKILL.md</code> est commun à Hermes, Claude Code et
          agentskills.io : le dossier <code>skill/</code> du dépôt se copie tel
          quel dans n'importe quel autre harnais.
        </p>
      </div>
    </>
  );
}
