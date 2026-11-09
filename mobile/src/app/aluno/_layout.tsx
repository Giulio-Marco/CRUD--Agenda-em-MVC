import { NativeTabs } from 'expo-router/native-tabs';

import { colors } from '@/theme';

// Abas do ALUNO. URLs: /aluno, /aluno/matriculas, /aluno/trilhas, /aluno/planos, /aluno/contatos.
export default function AlunoTabsLayout() {
  return (
    <NativeTabs tintColor={colors.primary} backgroundColor={colors.surface}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Cursos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book" md="menu_book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="matriculas">
        <NativeTabs.Trigger.Label>Matrículas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="graduationcap" md="school" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="trilhas">
        <NativeTabs.Trigger.Label>Trilhas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="map" md="map" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="planos">
        <NativeTabs.Trigger.Label>Planos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="creditcard" md="credit_card" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="contatos">
        <NativeTabs.Trigger.Label>Contatos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2" md="contacts" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
