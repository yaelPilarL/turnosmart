import { expect, test, type Page } from '@playwright/test';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

// Sin cuenta de prueba el E2E falla: "no hay tests" no debe interpretarse como éxito.
if (!email || !password) {
  throw new Error('Definir E2E_USER_EMAIL y E2E_USER_PASSWORD (cuenta de prueba provisionada en Supabase)');
}

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Contraseña').fill(password!);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // Una cuenta nueva pasa por el onboarding una única vez.
  await page.waitForURL(/\/(customers|onboarding)/);
  if (page.url().includes('/onboarding')) {
    await page.getByLabel('Nombre del negocio').fill('Negocio E2E');
    await page.getByRole('button', { name: 'Crear negocio' }).click();
  }
  await expect(page).toHaveURL(/\/customers/);
}

test('credenciales inválidas muestran error y permiten reintentar', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Contraseña').fill('contraseña-incorrecta');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('alert')).toContainText('incorrectos');
  await expect(page).toHaveURL(/\/login/);
});

test('ruta protegida sin sesión redirige a login', async ({ page }) => {
  await page.goto('/customers');
  await expect(page).toHaveURL(/\/login/);
});

test('recorrido crítico: login → cliente → recarga → edición → logout', async ({ page }) => {
  const name = `Cliente E2E ${Date.now()}`;
  await login(page);

  // Alta con validación del servidor.
  await page.getByRole('button', { name: 'Nuevo cliente' }).click();
  await page.getByLabel('Nombre y apellido').fill(name);
  await page.getByLabel('Email').fill('no-es-un-email');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();

  await page.getByLabel('Email').fill('e2e@example.com');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  // Persistencia tras recargar (sesión recuperada).
  await page.reload();
  await page.getByLabel('Buscar clientes').fill(name);
  const row = page.getByRole('row', { name: new RegExp(name) });
  await expect(row).toBeVisible();

  // Edición persistente.
  await row.getByRole('button', { name: `Editar ${name}` }).click();
  await page.getByLabel('Teléfono').fill('221 555-0000');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.reload();
  await page.getByLabel('Buscar clientes').fill(name);
  await expect(page.getByRole('row', { name: new RegExp(name) })).toContainText('221 555-0000');

  // Logout cierra la sesión.
  await page.getByTestId('logout').click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/customers');
  await expect(page).toHaveURL(/\/login/);
});
