/**
 * @file src/components/ui/index.js
 * @description Barrel export for all primitive UI components.
 */

export { default as Button }          from './Button.jsx';

export { default as Badge }           from './Badge.jsx';
export { QualityBadge, MaturityBadge, HotBadge, GenreBadge } from './Badge.jsx';

export { default as Spinner }         from './Spinner.jsx';
export { PageLoader, ContentLoader }  from './Spinner.jsx';

export { default as Skeleton }        from './Skeleton.jsx';
export {
  SkeletonText,
  SkeletonAvatar,
  SkeletonMovieCard,
  SkeletonBackdropCard,
  SkeletonHero,
  SkeletonMovieRow,
  SkeletonDetailHero,
  SkeletonCastRow,
}                                     from './Skeleton.jsx';

export { default as Input }           from './Input.jsx';
export { SearchInput, Textarea }      from './Input.jsx';

export { default as Dropdown }        from './Dropdown.jsx';
export { SelectDropdown }             from './Dropdown.jsx';

export { default as Card }            from './Card.jsx';
export { InfoCard }                   from './Card.jsx';

export { default as Avatar }          from './Avatar.jsx';
export { AvatarGroup }                from './Avatar.jsx';

export { default as Rating }          from './Rating.jsx';
export { StarRating, ScoreBadge }     from './Rating.jsx';

export { default as Image }           from './Image.jsx';
