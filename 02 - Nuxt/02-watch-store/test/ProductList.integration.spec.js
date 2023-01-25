import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import axios from 'axios';
import ProductList from '../pages';
import { makeServer } from '@/miragejs/server';
import Search from '@/components/Search';

import ProductCard from '@/components/ProductCard';

jest.mock('axios', () => ({
  get: jest.fn(),
}));
// para entender melhor o jest.mock()
// https://jestjs.io/pt-BR/docs/es6-class-mocks#chamar--jestmock-com-o-par%C3%A2metro-de-module-factory

describe('ProductList - integration', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  const getProducts = async (quantity = 10, overrides = []) => {
    let overridesList = [];
    if (overrides.length > 0) {
      overridesList = overrides.map((override) =>
        server.create('product', override)
      );
    }
    const products = [
      ...server.createList('product', quantity),
      ...overridesList,
    ];

    return products;
  };

  const mountProductList = async (
    quantity = 10,
    overrides = [],
    shouldReject = false
  ) => {
    const products = await getProducts(quantity, overrides);
    if (shouldReject) {
      await axios.get.mockReturnValue(
        Promise.reject(new Error('Problemas ao carregar a lista!'))
      );
    } else {
      await axios.get.mockReturnValue(Promise.resolve({ data: { products } }));
    }
    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });
    await nextTick();

    return { wrapper, products };
  };

  it('should mount the component', () => {
    const wrapper = mount(ProductList);
    expect(wrapper.vm).toBeDefined();
  });

  it('should mount the Search component', () => {
    const wrapper = mount(ProductList);
    expect(wrapper.findComponent(Search)).toBeDefined();
    // findComponent vai buscar o componente filho passado em seu parametro no arquivo em questão, no caso o index.vue
  });

  it('should mount the ProductCard component 10 times', async () => {
    const products = server.createList('product', 10);

    axios.get.mockReturnValue(Promise.resolve({ data: { products } }));

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await nextTick();
    // nextTick é um metodo de espera do DOM, ele só atualiza os dados por fila, ou seja, tudo que estiver abaixo dele só vai ser executado depois que os de cima forem concluidos.

    const cards = wrapper.findAllComponents(ProductCard);
    // como o ProductCard ele é passado por um v-for e repetido mais de uma vez, é necessário usar o findAllComponents...
    expect(cards).toHaveLength(10);
    // ...e como o toHaveLength podemos determinar uma quantidade para as repetições.
  });

  it('should call axios.get on component mount', () => {
    mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });
    expect(axios.get).toHaveBeenCalledTimes(2);
    // toHaveBeenCalledTimes vai contar a quantidade de vezes que a requisição vai ser chamada
    expect(axios.get).toBeCalledWith('/api/products');
    // toBeCalledWith pega a rota da API em questão
  });

  it('should display error message when Promise rejects', async () => {
    axios.get.mockReturnValue(Promise.reject(new Error('')));

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await nextTick();
    // nextTick é um metodo de espera do DOM, ele só atualiza os dados por fila, ou seja, tudo que estiver abaixo dele só vai ser executado depois que os de cima forem concluidos.

    expect(wrapper.text()).toContain('Problemas ao carregar a lista');
  });

  // it('should filter the product list when a search performed', async () => {
  //   // Arrange
  //   const products = [
  //     ...server.createList('product', 10),
  //     server.create('product', {
  //       title: 'meu relogio',
  //     }),
  //     server.create('product', {
  //       title: 'outro relogio',
  //     }),
  //   ];

  //   axios.get.mockReturnValue(Promise.resolve({ data: { products } }));

  //   const wrapper = mount(ProductList, {
  //     mocks: {
  //       $axios: axios,
  //     },
  //   });

  //   await nextTick();
  //   // nextTick é um metodo de espera do DOM, ele só atualiza os dados por fila, ou seja, tudo que estiver abaixo dele só vai ser executado depois que os de cima forem concluidos.

  //   // Act
  //   const search = wrapper.findComponent(Search);
  //   await search.find('input[type="search"]').setValue('relogio');
  //   await search.find('form').trigger('submit');

  //   // Assert

  //   const cards = wrapper.findAllComponents(ProductCard);
  //   // como o ProductCard ele é passado por um v-for e repetido mais de uma vez, é necessário usar o findAllComponents...
  //   expect(wrapper.vm.searchTerm).toEqual('relogio');
  //   expect(cards).toHaveLength(2);
  //   // ...e como o toHaveLength podemos determinar uma quantidade para as repetições.
  // });

  it('should filter the product list whan a search is performed', async () => {
    const { wrapper } = await mountProductList(10, [
      {
        title: 'Meu relógio favorito',
      },
      { title: 'Meu outro relógio favorito' },
    ]);

    const search = wrapper.findComponent(Search);
    await search.find('input[type="search"]').setValue('relógio');
    await search.find('form').trigger('submit');
    expect(wrapper.vm.searchTerm).toEqual('relógio');
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(2);
  });

  it('should filter the product list whan a search is performed', async () => {
    const { wrapper } = await mountProductList(10, [
      {
        title: 'Meu relógio favorito',
      },
    ]);

    const search = wrapper.findComponent(Search);
    await search.find('input[type="search"]').setValue('relógio');
    await search.find('form').trigger('submit');
    await search.find('input[type="search"]').setValue('');
    await search.find('form').trigger('submit');

    expect(wrapper.vm.searchTerm).toEqual('');
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(11);
  });
});
