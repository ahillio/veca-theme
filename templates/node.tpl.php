<article<?php print $attributes; ?>>
  <?php print $user_picture; ?>
  <?php print render($title_prefix); ?>
  <?php if ( (!$page && $title) || $display_submitted): ?>
  <header>
	<?php if (!$page && $title): ?>
    <h2<?php print $title_attributes; ?>><a href="<?php print $node_url ?>" title="<?php print $title ?>"><?php print $title ?></a></h2>
    <?php endif; ?>
    <?php if ($display_submitted): ?>
      <div class="submitted-date"><?php print $date; ?></div>
      <div class="submitted-name">By <?php print $name; ?></div>
    <?php endif; ?>
      <?php if (!empty($content['field_blog_issue'])): ?>
        <div class="submitted-issue"><?php print render($content['field_blog_issue']); ?></div>
      <?php endif; ?>
  </header>
  <?php endif; ?>
  <?php print render($title_suffix); ?>
    
  
  <div<?php print $content_attributes; ?>>
    <?php
      // We hide the comments and links now so that we can render them later.
      hide($content['comments']);
      hide($content['links']);
      print render($content);
    ?>
  </div>
  
  <div class="clearfix">
    <?php if (!empty($content['links'])): ?>
      <nav class="links node-links clearfix"><?php print render($content['links']); ?></nav>
    <?php endif; ?>

    <?php print render($content['comments']); ?>
  </div>
</article>
