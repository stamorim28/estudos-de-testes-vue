import { mount } from '@vue/test-utils';
import Search from '@/components/Search';
import { makeServer } from '@/miragejs/server';

describe('Search - unit', () => {
  it('should mount the component', () => {
    const wrapper = mount(Search);
    expect(wrapper.vm).toBeDefined();
  });

  it('should emit search event when button form is submitted', async () => {
    const wrapper = mount(Search);
    const term = 'termo de busca';

    await wrapper.find('input[type="search"]').setValue(term);
    // await para quando o evento em questão for disparado

    await wrapper.find('form').trigger('submit');

    // assert event has been emitted
    expect(wrapper.emitted().doSearch).toBeTruthy();

    // assert event count
    expect(wrapper.emitted().doSearch.length).toBe(1);

    // assert event payload
    expect(wrapper.emitted().doSearch[0]).toEqual([{ term }]);
  });

  it('should emit search event when search input is cleared', async () => {
    const wrapper = mount(Search);
    const term = 'termo de busca';
    const input = wrapper.find('input[type="search"]');

    await input.setValue(term);
    await input.setValue('');
    // await para quando o evento em questão for disparado

    // assert event has been emitted
    expect(wrapper.emitted().doSearch).toBeTruthy();

    // assert event count
    expect(wrapper.emitted().doSearch.length).toBe(1);

    // assert event payload
    expect(wrapper.emitted().doSearch[0]).toEqual([{ term: '' }]);
  });
});
