import { mount } from '@vue/test-utils'
import home from '@/pages/home/index.vue'
import HelloWorld from '@/components/modules/helloWorld.vue'

describe('HelloWorld.vue', () => {
  it('render img', () => {
    const msg = 'new message'
    const wrapper = mount(home)
    expect(wrapper.contains(HelloWorld)).toBe(true)
  })
})
