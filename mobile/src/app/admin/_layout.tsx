import { NativeTabs } from 'expo-router/native-tabs';

import { colors } from '@/theme';

// Abas do ADMIN. URLs: /admin, /admin/categorias, /admin/trilhas, /admin/planos, /admin/usuarios.
export default function AdminTabsLayout() {
  return (
    <NativeTabs tintColor={colors.primary} backgroundColor={colors.surface}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Cursos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book" md="menu_book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="categorias">
        <NativeTabs.Trigger.Label>Categorias</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="tag" md="label" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="trilhas">
        <NativeTabs.Trigger.Label>Trilhas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="map" md="map" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="planos">
        <NativeTabs.Trigger.Label>Planos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="creditcard" md="credit_card" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="usuarios">
        <NativeTabs.Trigger.Label>Usuários</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.3" md="group" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
