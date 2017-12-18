'use strict';

export function getQuerySelector(target) {
  if (target.id === '') {
    let
      siblings = [ target.nodeName.toLowerCase() ],
      sibling = target.previousSibling;

    while (sibling !== null) {
      if (sibling.id !== '' && sibling.id !== undefined) {
        return '#' + sibling.id + '+' + joinSiblings(siblings);
      }

      if (sibling.nodeType === Node.ELEMENT_NODE) {
        siblings.push(sibling.nodeName.toLowerCase());
      }

      sibling = sibling.previousSibling;
    }

    let
      parents = [],
      parent = target.parentNode;

    while (parent !== null) {
      if (parent.id !== '' && parent.id !== undefined) {
        return '#' + parent.id + '>' + joinParents(parents) + joinSiblings(siblings);
      }

      if (parent.nodeType === Node.DOCUMENT_NODE) break;

      if (parent.nodeType === Node.ELEMENT_NODE) {
        parents.push(parent.nodeName.toLowerCase());
      }
      parent = parent.parentNode;
    }

    return joinParents(parents) + joinSiblings(siblings);
  }

  return '#' + target.id;
}

function joinSiblings(siblings) {
  if (siblings.length > 0) {
    return siblings.reverse().join('+');
  }
  return '';
}

function joinParents(parents) {
  if (parents.length > 0) {
    return parents.reverse().join('>') + '>';
  }
  return '';
}

