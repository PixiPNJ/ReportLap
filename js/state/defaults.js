function modeloLaptopOriginal(n) {
  if ([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,18,20,21,22,23,24,25,36,37,38].includes(n)) return 'HP Pavilion Gaming 15-dk0015la';
  if ([16,17,19,26,27,28,29,30,31,32,33,39,41].includes(n)) return 'Dell Inspiron 15 3520';
  if ([34,35,40].includes(n)) return 'Dell Inspiron 15 3593';
  return 'HP Pavilion Gaming 15-dk0015la';
}

function rango(n) {
  return Array.from({ length: n }, (_, i) => ({ id: i + 1 }));
}

export function defaultAppData() {
  const laptops = [];
  for (let i = 1; i <= 41; i++) laptops.push({ id: i, modelo: modeloLaptopOriginal(i) });

  return {
    tipos: [
      {
        id: 'laptops',
        nombre: 'Laptops',
        icono: '💻',
        agrupado: false,
        itemNoun: 'Laptop',
        items: laptops,
      },
      {
        id: 'tablets',
        nombre: 'Tablets',
        icono: '📱',
        agrupado: true,
        groupNoun: 'Carro',
        itemNoun: 'Tablet',
        grupos: [
          { id: 'c1', nombre: 'Carro 1', modelo: 'TB-8505FS', items: rango(44) },
          { id: 'c2', nombre: 'Carro 2', modelo: 'TB-8304F1', items: rango(44) },
        ],
      },
      {
        id: 'bigtablet',
        nombre: 'Big Tablets',
        icono: '📺',
        agrupado: true,
        groupNoun: 'Sala',
        itemNoun: 'Tablet',
        grupos: Array.from({ length: 12 }, (_, i) => ({
          id: 's' + (i + 1),
          nombre: 'Sala ' + (i + 1),
          items: [{ id: 1 }],
        })),
      },
    ],
    registros: {},
    historial: {},
  };
}
