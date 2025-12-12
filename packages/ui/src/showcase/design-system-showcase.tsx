'use client';

import { ThemeShowcasePage } from './theme-showcase-page';
import { ShowcaseContainer } from './components/showcase-container';
import { ButtonsSection } from './sections/buttons-section';
import { InputsSection } from './sections/inputs-section';
import { CardsSection } from './sections/cards-section';
import { ProgressSection } from './sections/progress-section';
import { ToastsSection } from './sections/toasts-section';
import { LoadingSection } from './sections/loading-section';
import { ModalsSection } from './sections/modals-section';
import { ListsSection } from './sections/lists-section';
import { AvatarsSection } from './sections/avatars-section';
import { FormsSection } from './sections/forms-section';
import { ThemeSection } from './sections/theme-section';
import { TopNavSection } from './sections/top-nav-section';
import { NotesComposerSection } from './sections/notes-composer-section';

const sections = [
  { id: 'top-nav', title: 'Top Navigation' },
  { id: 'notes-composer', title: 'Notes Composer' },
  { id: 'buttons', title: 'Buttons' },
  { id: 'inputs', title: 'Form Inputs' },
  { id: 'cards', title: 'Cards' },
  { id: 'progress', title: 'Progress' },
  { id: 'loading', title: 'Loading States' },
  { id: 'toasts', title: 'Toasts' },
  { id: 'modals', title: 'Modals & Dialogs' },
  { id: 'lists', title: 'Lists' },
  { id: 'avatars', title: 'Avatars' },
  { id: 'forms', title: 'Form Controls' },
  { id: 'theme', title: 'Theme & Colors' },
];

export function DesignSystemShowcase() {
  return (
    <ThemeShowcasePage sections={sections}>
      <ShowcaseContainer id="top-nav" title="Top Navigation">
        <TopNavSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="notes-composer" title="Notes Composer">
        <NotesComposerSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="buttons" title="Buttons">
        <ButtonsSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="inputs" title="Form Inputs">
        <InputsSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="cards" title="Cards">
        <CardsSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="progress" title="Progress">
        <ProgressSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="loading" title="Loading States">
        <LoadingSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="toasts" title="Toasts">
        <ToastsSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="modals" title="Modals & Dialogs">
        <ModalsSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="lists" title="Lists">
        <ListsSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="avatars" title="Avatars">
        <AvatarsSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="forms" title="Form Controls">
        <FormsSection />
      </ShowcaseContainer>

      <ShowcaseContainer id="theme" title="Theme & Colors">
        <ThemeSection />
      </ShowcaseContainer>
    </ThemeShowcasePage>
  );
}
