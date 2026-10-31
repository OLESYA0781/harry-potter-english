import {expect,it} from 'vitest';
import {falseScenes,roomQuestions,townPlaces,townTransport,whoScenes,wordKey} from './speaking';
it('has four paired portraits, one eleven-question room and exactly three false-fact scenes',()=>{
 expect(whoScenes).toHaveLength(4);expect(whoScenes.every(scene=>scene.questions?.length===5)).toBe(true);
 expect(roomQuestions).toHaveLength(11);expect(falseScenes).toHaveLength(3);expect(falseScenes.every(scene=>scene.facts?.length===3 && scene.answers?.length===3)).toBe(true);
});
it('retains every Go Getter place and transport word with stable noncolliding reveal keys',()=>{
 expect(townPlaces.map(word=>word.en)).toEqual(['bank','café','cinema','hospital','hotel','museum','park','restaurant','stadium','theatre']);
 expect(townTransport.map(word=>word.en)).toEqual(['bike','boat','bus','car','motorbike','plane','taxi','train','tram','underground']);
 expect(new Set([...townPlaces,...townTransport].map(word=>wordKey(word.id))).size).toBe(20);
});
